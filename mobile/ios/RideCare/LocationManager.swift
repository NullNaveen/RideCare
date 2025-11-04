//
//  LocationManager.swift
//  RideCare
//
//  CoreLocation wrapper for automatic trip detection
//

import Foundation
import CoreLocation

@objc(LocationManager)
class LocationManager: NSObject, CLLocationManagerDelegate {
  
  private let locationManager = CLLocationManager()
  private var isTracking = false
  private var locations: [CLLocation] = []
  private var startTime: Date?
  
  // Configuration
  private let AUTO_START_SPEED_THRESHOLD: CLLocationSpeed = 10.0 / 3.6 // 10 km/h in m/s
  private let AUTO_START_DURATION: TimeInterval = 30 // 30 seconds
  private let AUTO_STOP_DURATION: TimeInterval = 600 // 10 minutes
  
  private var highSpeedStartTime: Date?
  private var stationaryStartTime: Date?
  private var lastLocation: CLLocation?
  
  override init() {
    super.init()
    locationManager.delegate = self
    locationManager.desiredAccuracy = kCLLocationAccuracyBest
    locationManager.allowsBackgroundLocationUpdates = true
    locationManager.pausesLocationUpdatesAutomatically = false
    locationManager.showsBackgroundLocationIndicator = true
  }
  
  // MARK: - Public Methods
  
  @objc
  func requestPermissions(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let status = locationManager.authorizationStatus
    
    switch status {
    case .notDetermined:
      locationManager.requestAlwaysAuthorization()
      resolve(["status": "prompt"])
    case .authorizedAlways:
      resolve(["status": "granted"])
    case .authorizedWhenInUse:
      locationManager.requestAlwaysAuthorization()
      resolve(["status": "whenInUse"])
    case .denied, .restricted:
      resolve(["status": "denied"])
    @unknown default:
      resolve(["status": "unknown"])
    }
  }
  
  @objc
  func startTracking(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard locationManager.authorizationStatus == .authorizedAlways else {
      reject("PERMISSION_DENIED", "Location permission not granted", nil)
      return
    }
    
    isTracking = true
    locations = []
    startTime = Date()
    
    locationManager.startUpdatingLocation()
    
    // Start region monitoring for auto-stop
    let region = CLCircularRegion(
      center: locationManager.location?.coordinate ?? CLLocationCoordinate2D(latitude: 0, longitude: 0),
      radius: 100,
      identifier: "current_location"
    )
    region.notifyOnExit = true
    locationManager.startMonitoring(for: region)
    
    resolve(["started": true, "startTime": startTime?.timeIntervalSince1970])
  }
  
  @objc
  func stopTracking(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard isTracking else {
      reject("NOT_TRACKING", "Tracking is not active", nil)
      return
    }
    
    isTracking = false
    locationManager.stopUpdatingLocation()
    
    // Calculate trip summary
    let endTime = Date()
    let distance = calculateTotalDistance()
    let duration = endTime.timeIntervalSince(startTime ?? endTime)
    
    let tripData: [String: Any] = [
      "startTime": startTime?.timeIntervalSince1970 ?? 0,
      "endTime": endTime.timeIntervalSince1970,
      "distance": distance / 1000, // Convert to km
      "duration": duration,
      "locations": locations.map { loc in
        return [
          "latitude": loc.coordinate.latitude,
          "longitude": loc.coordinate.longitude,
          "speed": loc.speed,
          "timestamp": loc.timestamp.timeIntervalSince1970
        ]
      }
    ]
    
    // Reset state
    locations = []
    startTime = nil
    highSpeedStartTime = nil
    stationaryStartTime = nil
    lastLocation = nil
    
    resolve(tripData)
  }
  
  @objc
  func enableAutoStart(_ enable: Bool, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if enable {
      locationManager.startMonitoringSignificantLocationChanges()
      resolve(["autoStartEnabled": true])
    } else {
      locationManager.stopMonitoringSignificantLocationChanges()
      resolve(["autoStartEnabled": false])
    }
  }
  
  // MARK: - CLLocationManagerDelegate
  
  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    guard let location = locations.last else { return }
    
    // Store location if tracking
    if isTracking {
      self.locations.append(location)
      
      // Adjust update interval based on speed
      let interval = getGPSInterval(speed: location.speed)
      locationManager.desiredAccuracy = interval < 5 ? kCLLocationAccuracyBest : kCLLocationAccuracyNearestTenMeters
      
      // Send location update to React Native
      sendLocationUpdate(location)
      
      // Check for auto-stop (stationary for 10 minutes)
      if location.speed < 1.0 { // Less than 1 m/s (3.6 km/h)
        if stationaryStartTime == nil {
          stationaryStartTime = Date()
        } else if Date().timeIntervalSince(stationaryStartTime!) > AUTO_STOP_DURATION {
          // Auto-stop
          stopTracking({ _ in }, rejecter: { _, _, _ in })
        }
      } else {
        stationaryStartTime = nil
      }
    } else {
      // Check for auto-start
      if location.speed > AUTO_START_SPEED_THRESHOLD {
        if highSpeedStartTime == nil {
          highSpeedStartTime = Date()
        } else if Date().timeIntervalSince(highSpeedStartTime!) > AUTO_START_DURATION {
          // Auto-start
          startTracking({ _ in }, rejecter: { _, _, _ in })
          highSpeedStartTime = nil
        }
      } else {
        highSpeedStartTime = nil
      }
    }
    
    lastLocation = location
  }
  
  func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
    // Notify React Native of permission change
    sendEvent(withName: "onPermissionChange", body: ["status": authorizationStatusString(status)])
  }
  
  // MARK: - Helper Methods
  
  private func calculateTotalDistance() -> CLLocationDistance {
    guard locations.count > 1 else { return 0 }
    
    var totalDistance: CLLocationDistance = 0
    for i in 1..<locations.count {
      totalDistance += locations[i].distance(from: locations[i - 1])
    }
    return totalDistance
  }
  
  private func getGPSInterval(speed: CLLocationSpeed) -> TimeInterval {
    let kmh = speed * 3.6 // Convert m/s to km/h
    
    if kmh > 20 {
      return 1.0 // High speed: 1 second
    } else if kmh > 10 {
      return 5.0 // Medium speed: 5 seconds
    } else {
      return 30.0 // Low speed: 30 seconds
    }
  }
  
  private func authorizationStatusString(_ status: CLAuthorizationStatus) -> String {
    switch status {
    case .notDetermined: return "notDetermined"
    case .restricted: return "restricted"
    case .denied: return "denied"
    case .authorizedAlways: return "authorizedAlways"
    case .authorizedWhenInUse: return "authorizedWhenInUse"
    @unknown default: return "unknown"
    }
  }
  
  private func sendLocationUpdate(_ location: CLLocation) {
    sendEvent(withName: "onLocationUpdate", body: [
      "latitude": location.coordinate.latitude,
      "longitude": location.coordinate.longitude,
      "speed": location.speed * 3.6, // Convert to km/h
      "timestamp": location.timestamp.timeIntervalSince1970
    ])
  }
  
  // MARK: - React Native Bridge
  
  @objc
  func supportedEvents() -> [String] {
    return ["onLocationUpdate", "onPermissionChange", "onTripAutoStarted", "onTripAutoStopped"]
  }
  
  private func sendEvent(withName name: String, body: Any?) {
    // This would be handled by RCTEventEmitter in the bridge file
    NotificationCenter.default.post(name: NSNotification.Name(name), object: body)
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
