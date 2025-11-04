package com.ridecare;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

/**
 * NotificationModule.java
 * 
 * React Native module for NotificationHelper
 */
public class NotificationModule extends ReactContextBaseJavaModule {
    
    private NotificationHelper notificationHelper;
    
    public NotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        notificationHelper = new NotificationHelper(reactContext);
    }
    
    @Override
    public String getName() {
        return "NotificationModule";
    }
    
    @ReactMethod
    public void requestPermissions(Promise promise) {
        // For Android, notification permissions are granted at install time (< Android 13)
        // For Android 13+, this would trigger the runtime permission dialog
        WritableMap result = new WritableNativeMap();
        result.putBoolean("granted", notificationHelper.areNotificationsEnabled());
        promise.resolve(result);
    }
    
    @ReactMethod
    public void checkPermissions(Promise promise) {
        WritableMap result = new WritableNativeMap();
        String status = notificationHelper.areNotificationsEnabled() ? "granted" : "denied";
        result.putString("status", status);
        promise.resolve(result);
    }
    
    @ReactMethod
    public void showMaintenanceReminder(
        int notificationId,
        String title,
        String body,
        ReadableMap data,
        Promise promise
    ) {
        try {
            String maintenanceId = data.hasKey("maintenanceId") ? data.getString("maintenanceId") : "";
            boolean isOverdue = data.hasKey("isOverdue") && data.getBoolean("isOverdue");
            
            notificationHelper.showMaintenanceReminder(
                notificationId,
                title,
                body,
                maintenanceId,
                isOverdue
            );
            
            WritableMap result = new WritableNativeMap();
            result.putBoolean("shown", true);
            result.putInt("id", notificationId);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void cancelNotification(int notificationId, Promise promise) {
        try {
            notificationHelper.cancelNotification(notificationId);
            
            WritableMap result = new WritableNativeMap();
            result.putBoolean("cancelled", true);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void cancelAllNotifications(Promise promise) {
        try {
            notificationHelper.cancelAllNotifications();
            
            WritableMap result = new WritableNativeMap();
            result.putBoolean("cancelledAll", true);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}
