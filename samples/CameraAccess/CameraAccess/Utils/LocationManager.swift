/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

//
// LocationManager.swift
//
// CoreLocation wrapper for GPS tracking and geofence monitoring.
// Handles location permissions and region monitoring callbacks.
//

import CoreLocation
import Foundation

@MainActor
class LocationManager: NSObject, ObservableObject {
  private let locationManager = CLLocationManager()
  
  @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
  @Published var currentLocation: CLLocation?
  @Published var lastError: String?
  
  // Callbacks for geofence events
  var onEnterRegion: ((String) -> Void)?  // Region identifier
  var onExitRegion: ((String) -> Void)?   // Region identifier
  
  override init() {
    super.init()
    locationManager.delegate = self
    locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters  // Battery efficient
    locationManager.distanceFilter = 50  // Update every 50 meters
    // Note: allowsBackgroundLocationUpdates is set when starting updates, not at init
    locationManager.pausesLocationUpdatesAutomatically = true
    authorizationStatus = locationManager.authorizationStatus
    NSLog("[LocationManager] Initialized - status: \(authorizationStatus.rawValue)")
  }
  
  // MARK: - Permissions
  
  func requestWhenInUsePermission() {
    NSLog("[LocationManager] Requesting When In Use permission")
    locationManager.requestWhenInUseAuthorization()
  }
  
  func requestAlwaysPermission() {
    NSLog("[LocationManager] Requesting Always permission")
    locationManager.requestAlwaysAuthorization()
  }
  
  var hasLocationPermission: Bool {
    authorizationStatus == .authorizedWhenInUse || authorizationStatus == .authorizedAlways
  }
  
  var hasAlwaysPermission: Bool {
    authorizationStatus == .authorizedAlways
  }
  
  // MARK: - Location Updates
  
  func startUpdatingLocation() {
    guard hasLocationPermission else {
      NSLog("[LocationManager] Cannot start - no permission")
      return
    }
    // Enable background updates only when we have permission and are actively using location
    if hasAlwaysPermission {
      locationManager.allowsBackgroundLocationUpdates = true
    }
    locationManager.startUpdatingLocation()
    NSLog("[LocationManager] Started location updates")
  }
  
  func stopUpdatingLocation() {
    locationManager.stopUpdatingLocation()
    NSLog("[LocationManager] Stopped location updates")
  }
  
  func requestSingleLocation() {
    guard hasLocationPermission else {
      NSLog("[LocationManager] Cannot request location - no permission")
      return
    }
    locationManager.requestLocation()
    NSLog("[LocationManager] Requested single location")
  }
  
  // MARK: - Region Monitoring (Geofencing)
  
  func startMonitoring(region: CLCircularRegion) {
    guard hasAlwaysPermission else {
      NSLog("[LocationManager] Cannot monitor region - need Always permission")
      return
    }
    
    guard CLLocationManager.isMonitoringAvailable(for: CLCircularRegion.self) else {
      NSLog("[LocationManager] Region monitoring not available on this device")
      return
    }
    
    locationManager.startMonitoring(for: region)
    NSLog("[LocationManager] Started monitoring region: \(region.identifier)")
  }
  
  func stopMonitoring(region: CLCircularRegion) {
    locationManager.stopMonitoring(for: region)
    NSLog("[LocationManager] Stopped monitoring region: \(region.identifier)")
  }
  
  func stopMonitoringAll() {
    for region in locationManager.monitoredRegions {
      locationManager.stopMonitoring(for: region)
    }
    NSLog("[LocationManager] Stopped monitoring all regions")
  }
  
  var monitoredRegionCount: Int {
    locationManager.monitoredRegions.count
  }
}

// MARK: - CLLocationManagerDelegate
extension LocationManager: CLLocationManagerDelegate {
  
  nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
    Task { @MainActor in
      self.authorizationStatus = manager.authorizationStatus
      NSLog("[LocationManager] Authorization changed: \(manager.authorizationStatus.rawValue)")
    }
  }
  
  nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    guard let location = locations.last else { return }
    Task { @MainActor in
      self.currentLocation = location
      NSLog("[LocationManager] Location updated: \(location.coordinate.latitude), \(location.coordinate.longitude)")
    }
  }
  
  nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
    Task { @MainActor in
      self.lastError = error.localizedDescription
      NSLog("[LocationManager] Error: \(error.localizedDescription)")
    }
  }
  
  // MARK: - Region Monitoring Callbacks
  
  nonisolated func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
    NSLog("[LocationManager] 📍 ENTERED region: \(region.identifier)")
    Task { @MainActor in
      self.onEnterRegion?(region.identifier)
    }
  }
  
  nonisolated func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
    NSLog("[LocationManager] 📍 EXITED region: \(region.identifier)")
    Task { @MainActor in
      self.onExitRegion?(region.identifier)
    }
  }
  
  nonisolated func locationManager(_ manager: CLLocationManager, monitoringDidFailFor region: CLRegion?, withError error: Error) {
    NSLog("[LocationManager] Monitoring failed for \(region?.identifier ?? "unknown"): \(error.localizedDescription)")
  }
  
  nonisolated func locationManager(_ manager: CLLocationManager, didStartMonitoringFor region: CLRegion) {
    NSLog("[LocationManager] ✅ Started monitoring: \(region.identifier)")
  }
}
