package com.ridecare;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;

/**
 * NotificationHelper.java
 * 
 * Helper class for creating and managing notifications
 */
public class NotificationHelper {
    
    private static final String MAINTENANCE_CHANNEL_ID = "maintenance_reminders";
    private static final String TRACKING_CHANNEL_ID = "location_tracking";
    
    private Context context;
    private NotificationManager notificationManager;
    
    public NotificationHelper(Context context) {
        this.context = context;
        this.notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        createNotificationChannels();
    }
    
    /**
     * Create notification channels (Android 8.0+)
     */
    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Maintenance Reminders Channel
            NotificationChannel maintenanceChannel = new NotificationChannel(
                MAINTENANCE_CHANNEL_ID,
                "Maintenance Reminders",
                NotificationManager.IMPORTANCE_HIGH
            );
            maintenanceChannel.setDescription("Notifications for upcoming bike maintenance");
            maintenanceChannel.enableVibration(true);
            maintenanceChannel.enableLights(true);
            
            // Location Tracking Channel
            NotificationChannel trackingChannel = new NotificationChannel(
                TRACKING_CHANNEL_ID,
                "Location Tracking",
                NotificationManager.IMPORTANCE_LOW
            );
            trackingChannel.setDescription("Shows when RideCare is tracking your ride");
            trackingChannel.setShowBadge(false);
            
            notificationManager.createNotificationChannel(maintenanceChannel);
            notificationManager.createNotificationChannel(trackingChannel);
        }
    }
    
    /**
     * Show maintenance reminder notification
     */
    public void showMaintenanceReminder(
        int notificationId,
        String title,
        String body,
        String maintenanceId,
        boolean isOverdue
    ) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra("maintenanceId", maintenanceId);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, MAINTENANCE_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true);
        
        // Set color based on urgency
        if (isOverdue) {
            builder.setColor(0xFFE53935); // Red
        } else {
            builder.setColor(0xFFFF9800); // Orange
        }
        
        notificationManager.notify(notificationId, builder.build());
    }
    
    /**
     * Show trip tracking notification
     */
    public void showTrackingNotification(int notificationId, String text) {
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, TRACKING_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("RideCare")
            .setContentText(text)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(pendingIntent)
            .setOngoing(true);
        
        notificationManager.notify(notificationId, builder.build());
    }
    
    /**
     * Cancel notification
     */
    public void cancelNotification(int notificationId) {
        notificationManager.cancel(notificationId);
    }
    
    /**
     * Cancel all notifications
     */
    public void cancelAllNotifications() {
        notificationManager.cancelAll();
    }
    
    /**
     * Check if notifications are enabled
     */
    public boolean areNotificationsEnabled() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            return notificationManager.areNotificationsEnabled();
        }
        return true; // Assume enabled for older versions
    }
    
    /**
     * Get notification channel status
     */
    public boolean isChannelEnabled(String channelId) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = notificationManager.getNotificationChannel(channelId);
            return channel != null && channel.getImportance() != NotificationManager.IMPORTANCE_NONE;
        }
        return true;
    }
}
