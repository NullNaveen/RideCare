package com.ridecare;

import android.Manifest;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.os.IBinder;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;

/**
 * LocationModule.java
 * 
 * React Native module for LocationService
 */
public class LocationModule extends ReactContextBaseJavaModule {
    
    private LocationService locationService;
    private boolean isBound = false;
    
    private ServiceConnection connection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            LocationService.LocalBinder binder = (LocationService.LocalBinder) service;
            locationService = binder.getService();
            isBound = true;
        }
        
        @Override
        public void onServiceDisconnected(ComponentName name) {
            isBound = false;
        }
    };
    
    public LocationModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }
    
    @Override
    public String getName() {
        return "LocationModule";
    }
    
    @ReactMethod
    public void requestPermissions(Promise promise) {
        Context context = getReactApplicationContext();
        
        boolean hasFineLocation = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED;
        
        boolean hasBackgroundLocation = true;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            hasBackgroundLocation = ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_BACKGROUND_LOCATION
            ) == PackageManager.PERMISSION_GRANTED;
        }
        
        WritableMap result = new WritableNativeMap();
        if (hasFineLocation && hasBackgroundLocation) {
            result.putString("status", "granted");
        } else if (hasFineLocation) {
            result.putString("status", "partiallyGranted");
        } else {
            result.putString("status", "denied");
        }
        
        promise.resolve(result);
    }
    
    @ReactMethod
    public void startTracking(Promise promise) {
        try {
            Context context = getReactApplicationContext();
            
            if (!isBound) {
                Intent intent = new Intent(context, LocationService.class);
                context.startService(intent);
                context.bindService(intent, connection, Context.BIND_AUTO_CREATE);
            }
            
            if (locationService != null) {
                locationService.startTracking();
                
                WritableMap result = new WritableNativeMap();
                result.putBoolean("started", true);
                result.putDouble("startTime", System.currentTimeMillis());
                promise.resolve(result);
            } else {
                promise.reject("SERVICE_ERROR", "Location service not ready");
            }
        } catch (SecurityException e) {
            promise.reject("PERMISSION_DENIED", "Location permission not granted");
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void stopTracking(Promise promise) {
        try {
            if (locationService != null) {
                LocationService.TripSummary trip = locationService.stopTracking();
                
                WritableMap result = new WritableNativeMap();
                result.putDouble("startTime", trip.startTime);
                result.putDouble("endTime", trip.endTime);
                result.putDouble("distance", trip.distance / 1000); // Convert to km
                result.putDouble("duration", trip.duration / 1000); // Convert to seconds
                
                WritableArray locations = new WritableNativeArray();
                for (android.location.Location loc : trip.locations) {
                    WritableMap locMap = new WritableNativeMap();
                    locMap.putDouble("latitude", loc.getLatitude());
                    locMap.putDouble("longitude", loc.getLongitude());
                    locMap.putDouble("speed", loc.getSpeed() * 3.6); // Convert to km/h
                    locMap.putDouble("timestamp", loc.getTime());
                    locations.pushMap(locMap);
                }
                result.putArray("locations", locations);
                
                promise.resolve(result);
                
                // Unbind service
                if (isBound) {
                    getReactApplicationContext().unbindService(connection);
                    isBound = false;
                }
            } else {
                promise.reject("NOT_TRACKING", "Tracking is not active");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void enableAutoStart(boolean enable, Promise promise) {
        try {
            if (locationService != null) {
                locationService.enableAutoStart(enable);
                
                WritableMap result = new WritableNativeMap();
                result.putBoolean("autoStartEnabled", enable);
                promise.resolve(result);
            } else {
                promise.reject("SERVICE_ERROR", "Location service not ready");
            }
        } catch (SecurityException e) {
            promise.reject("PERMISSION_DENIED", "Location permission not granted");
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}
