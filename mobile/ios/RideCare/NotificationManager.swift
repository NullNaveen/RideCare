//
//  NotificationManager.swift
//  RideCare
//
//  Local notification manager for maintenance reminders
//

import Foundation
import UserNotifications

@objc(NotificationManager)
class NotificationManager: NSObject {
  
  private let notificationCenter = UNUserNotificationCenter.current()
  
  // MARK: - Public Methods
  
  @objc
  func requestPermissions(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    notificationCenter.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
      if let error = error {
        reject("PERMISSION_ERROR", error.localizedDescription, error)
      } else {
        resolve(["granted": granted])
      }
    }
  }
  
  @objc
  func checkPermissions(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    notificationCenter.getNotificationSettings { settings in
      let status: String
      switch settings.authorizationStatus {
      case .notDetermined:
        status = "notDetermined"
      case .denied:
        status = "denied"
      case .authorized, .provisional:
        status = "granted"
      @unknown default:
        status = "unknown"
      }
      resolve(["status": status])
    }
  }
  
  @objc
  func scheduleMaintenanceReminder(
    _ id: String,
    title: String,
    body: String,
    data: [String: Any],
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let content = UNMutableNotificationContent()
    content.title = title
    content.body = body
    content.sound = .default
    content.badge = 1
    content.userInfo = data
    
    // Trigger immediately (for Firebase-triggered notifications)
    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
    
    let request = UNNotificationRequest(identifier: id, content: content, trigger: trigger)
    
    notificationCenter.add(request) { error in
      if let error = error {
        reject("SCHEDULE_ERROR", error.localizedDescription, error)
      } else {
        resolve(["scheduled": true, "id": id])
      }
    }
  }
  
  @objc
  func scheduleRecurringReminder(
    _ id: String,
    title: String,
    body: String,
    hour: Int,
    minute: Int,
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let content = UNMutableNotificationContent()
    content.title = title
    content.body = body
    content.sound = .default
    
    // Trigger at specific time daily
    var dateComponents = DateComponents()
    dateComponents.hour = hour
    dateComponents.minute = minute
    
    let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
    
    let request = UNNotificationRequest(identifier: id, content: content, trigger: trigger)
    
    notificationCenter.add(request) { error in
      if let error = error {
        reject("SCHEDULE_ERROR", error.localizedDescription, error)
      } else {
        resolve(["scheduled": true, "id": id])
      }
    }
  }
  
  @objc
  func cancelNotification(_ id: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    notificationCenter.removePendingNotificationRequests(withIdentifiers: [id])
    resolve(["cancelled": true])
  }
  
  @objc
  func cancelAllNotifications(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    notificationCenter.removeAllPendingNotificationRequests()
    resolve(["cancelledAll": true])
  }
  
  @objc
  func getPendingNotifications(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    notificationCenter.getPendingNotificationRequests { requests in
      let notifications = requests.map { request -> [String: Any] in
        return [
          "id": request.identifier,
          "title": request.content.title,
          "body": request.content.body
        ]
      }
      resolve(["notifications": notifications])
    }
  }
  
  @objc
  func clearBadge(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      UIApplication.shared.applicationIconBadgeNumber = 0
      resolve(["cleared": true])
    }
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
