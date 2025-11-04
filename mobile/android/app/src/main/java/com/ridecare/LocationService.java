package com.ridecare;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Binder;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

import java.util.ArrayList;
import java.util.List;

/**
 * LocationService.java
 * 
 * Foreground service for background location tracking
 */
public class LocationService extends Service implements LocationListener {
    
    private static final String CHANNEL_ID = "location_tracking";
    private static final int NOTIFICATION_ID = 1001;
    
    private LocationManager locationManager;
    private final IBinder binder = new LocalBinder();
    private boolean isTracking = false;
    
    private List<Location> locations = new ArrayList<>();
    private long startTime;
    private Location lastLocation;
    
    // Configuration
    private static final float AUTO_START_SPEED_THRESHOLD = 10f / 3.6f; // 10 km/h in m/s
    private static final long AUTO_START_DURATION = 30000; // 30 seconds
    private static final long AUTO_STOP_DURATION = 600000; // 10 minutes
    
    private long highSpeedStartTime = 0;
    private long stationaryStartTime = 0;
    
    public class LocalBinder extends Binder {
        LocationService getService() {
            return LocationService.this;
        }
    }
    
    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        createNotificationChannel();
    }
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForeground(NOTIFICATION_ID, buildNotification("Tracking your ride..."));
        return START_STICKY;
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }
    
    /**
     * Start location tracking
     */
    public void startTracking() throws SecurityException {
        isTracking = true;
        locations.clear();
        startTime = System.currentTimeMillis();
        
        // Request location updates
        locationManager.requestLocationUpdates(
            LocationManager.GPS_PROVIDER,
            1000, // 1 second
            0,    // 0 meters
            this
        );
        
        // Also request network location as fallback
        locationManager.requestLocationUpdates(
            LocationManager.NETWORK_PROVIDER,
            5000, // 5 seconds
            0,
            this
        );
        
        updateNotification("Tracking active - " + locations.size() + " points");
    }
    
    /**
     * Stop location tracking
     */
    public TripSummary stopTracking() {
        isTracking = false;
        locationManager.removeUpdates(this);
        
        // Calculate trip summary
        long endTime = System.currentTimeMillis();
        double distance = calculateTotalDistance();
        long duration = endTime - startTime;
        
        TripSummary summary = new TripSummary(
            startTime,
            endTime,
            distance,
            duration,
            new ArrayList<>(locations)
        );
        
        // Reset state
        locations.clear();
        highSpeedStartTime = 0;
        stationaryStartTime = 0;
        lastLocation = null;
        
        stopForeground(true);
        stopSelf();
        
        return summary;
    }
    
    /**
     * Enable auto-start monitoring
     */
    public void enableAutoStart(boolean enable) throws SecurityException {
        if (enable) {
            // Request location updates for auto-start detection
            locationManager.requestLocationUpdates(
                LocationManager.GPS_PROVIDER,
                30000, // 30 seconds
                100,   // 100 meters
                this
            );
        } else {
            if (!isTracking) {
                locationManager.removeUpdates(this);
            }
        }
    }
    
    // MARK: - LocationListener
    
    @Override
    public void onLocationChanged(Location location) {
        if (isTracking) {
            locations.add(location);
            
            // Update notification
            updateNotification("Tracking - " + locations.size() + " points, " +
                String.format("%.1f km", calculateTotalDistance() / 1000));
            
            // Adjust update interval based on speed
            adjustUpdateInterval(location.getSpeed());
            
            // Check for auto-stop
            if (location.getSpeed() < 1.0f) { // Less than 3.6 km/h
                if (stationaryStartTime == 0) {
                    stationaryStartTime = System.currentTimeMillis();
                } else if (System.currentTimeMillis() - stationaryStartTime > AUTO_STOP_DURATION) {
                    // Auto-stop
                    stopTracking();
                    sendBroadcast(new Intent("com.ridecare.TRIP_AUTO_STOPPED"));
                }
            } else {
                stationaryStartTime = 0;
            }
        } else {
            // Check for auto-start
            if (location.getSpeed() > AUTO_START_SPEED_THRESHOLD) {
                if (highSpeedStartTime == 0) {
                    highSpeedStartTime = System.currentTimeMillis();
                } else if (System.currentTimeMillis() - highSpeedStartTime > AUTO_START_DURATION) {
                    // Auto-start
                    startTracking();
                    sendBroadcast(new Intent("com.ridecare.TRIP_AUTO_STARTED"));
                    highSpeedStartTime = 0;
                }
            } else {
                highSpeedStartTime = 0;
            }
        }
        
        lastLocation = location;
    }
    
    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {}
    
    @Override
    public void onProviderEnabled(String provider) {}
    
    @Override
    public void onProviderDisabled(String provider) {}
    
    // MARK: - Helper Methods
    
    private double calculateTotalDistance() {
        if (locations.size() < 2) return 0;
        
        double totalDistance = 0;
        for (int i = 1; i < locations.size(); i++) {
            totalDistance += locations.get(i - 1).distanceTo(locations.get(i));
        }
        return totalDistance;
    }
    
    private void adjustUpdateInterval(float speed) {
        try {
            locationManager.removeUpdates(this);
            
            long interval;
            float kmh = speed * 3.6f;
            
            if (kmh > 20) {
                interval = 1000; // 1 second
            } else if (kmh > 10) {
                interval = 5000; // 5 seconds
            } else {
                interval = 30000; // 30 seconds
            }
            
            locationManager.requestLocationUpdates(
                LocationManager.GPS_PROVIDER,
                interval,
                0,
                this
            );
        } catch (SecurityException e) {
            e.printStackTrace();
        }
    }
    
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Location Tracking",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Shows when RideCare is tracking your ride");
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }
    
    private Notification buildNotification(String text) {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("RideCare")
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build();
    }
    
    private void updateNotification(String text) {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        manager.notify(NOTIFICATION_ID, buildNotification(text));
    }
    
    // MARK: - TripSummary Class
    
    public static class TripSummary {
        public long startTime;
        public long endTime;
        public double distance;
        public long duration;
        public List<Location> locations;
        
        public TripSummary(long startTime, long endTime, double distance, long duration, List<Location> locations) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.distance = distance;
            this.duration = duration;
            this.locations = locations;
        }
    }
}
