/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

//
// GeofenceManager.swift
//
// Manages geofenced locations and triggers audio/message events.
// Coordinates between LocationManager and app UI/audio.
//

import Foundation
import CoreLocation
import SwiftUI

@MainActor
class GeofenceManager: ObservableObject {
  private let locationManager: LocationManager
  
  @Published var geofences: [Geofence] = []
  @Published var lastEvent: GeofenceEvent?
  @Published var showExitAlert: Bool = false
  @Published var exitAlertMessage: String = ""
  
  // Callbacks for the app to handle
  var onEnterGeofence: ((Geofence) -> Void)?
  var onExitGeofence: ((Geofence) -> Void)?
  
  init(locationManager: LocationManager) {
    self.locationManager = locationManager
    
    // Load saved geofences
    self.geofences = Geofence.loadAll()
    
    // Setup callbacks from LocationManager
    locationManager.onEnterRegion = { [weak self] regionId in
      Task { @MainActor in
        self?.handleEnterRegion(regionId)
      }
    }
    
    locationManager.onExitRegion = { [weak self] regionId in
      Task { @MainActor in
        self?.handleExitRegion(regionId)
      }
    }
    
    NSLog("[GeofenceManager] Ready - \(geofences.count) geofences loaded")
  }
  
  // MARK: - Permission Handling
  
  func requestPermissions() {
    if !locationManager.hasLocationPermission {
      locationManager.requestWhenInUsePermission()
    } else if !locationManager.hasAlwaysPermission {
      locationManager.requestAlwaysPermission()
    }
  }
  
  var hasRequiredPermissions: Bool {
    locationManager.hasAlwaysPermission
  }
  
  // MARK: - Geofence Management
  
  func addGeofence(_ geofence: Geofence) {
    // iOS limit: max 20 regions
    guard geofences.count < 20 else {
      NSLog("[GeofenceManager] Cannot add - max 20 geofences reached")
      return
    }
    
    geofences.append(geofence)
    Geofence.saveAll(geofences)
    
    // Start monitoring
    locationManager.startMonitoring(region: geofence.region)
    NSLog("[GeofenceManager] Added geofence: \(geofence.name)")
  }
  
  func removeGeofence(_ geofence: Geofence) {
    locationManager.stopMonitoring(region: geofence.region)
    geofences.removeAll { $0.id == geofence.id }
    Geofence.saveAll(geofences)
    NSLog("[GeofenceManager] Removed geofence: \(geofence.name)")
  }
  
  func removeAll() {
    locationManager.stopMonitoringAll()
    geofences.removeAll()
    Geofence.saveAll(geofences)
    NSLog("[GeofenceManager] Removed all geofences")
  }
  
  func startMonitoringAll() {
    guard hasRequiredPermissions else {
      NSLog("[GeofenceManager] Cannot start monitoring - need Always permission")
      requestPermissions()
      return
    }
    
    for geofence in geofences {
      locationManager.startMonitoring(region: geofence.region)
    }
    NSLog("[GeofenceManager] Started monitoring \(geofences.count) geofences")
  }
  
  // MARK: - Event Handlers
  
  private func handleEnterRegion(_ regionId: String) {
    guard let geofence = geofences.first(where: { $0.id.uuidString == regionId }) else {
      NSLog("[GeofenceManager] Unknown region entered: \(regionId)")
      return
    }
    
    NSLog("[GeofenceManager] 📍 ENTERED: \(geofence.name)")
    lastEvent = GeofenceEvent(type: .enter, geofence: geofence, timestamp: Date())
    
    // Trigger callback
    onEnterGeofence?(geofence)
  }
  
  private func handleExitRegion(_ regionId: String) {
    guard let geofence = geofences.first(where: { $0.id.uuidString == regionId }) else {
      NSLog("[GeofenceManager] Unknown region exited: \(regionId)")
      return
    }
    
    NSLog("[GeofenceManager] 📍 EXITED: \(geofence.name)")
    lastEvent = GeofenceEvent(type: .exit, geofence: geofence, timestamp: Date())
    
    // Show exit alert if message exists
    if let exitMessage = geofence.exitMessage {
      exitAlertMessage = exitMessage
      showExitAlert = true
    }
    
    // Trigger callback
    onExitGeofence?(geofence)
  }
  
  // MARK: - Convenience Methods
  
  func addTestGeofence(at location: CLLocation, name: String = "Test Location") {
    let geofence = Geofence(
      name: name,
      location: location,
      radius: 100,
      enterMessage: "You have arrived at \(name)",
      exitMessage: "You have left \(name)"
    )
    addGeofence(geofence)
  }
  
  func addGeofenceAtCurrentLocation(name: String, enterMessage: String?, exitMessage: String?) {
    guard let location = locationManager.currentLocation else {
      NSLog("[GeofenceManager] Cannot add - no current location")
      locationManager.requestSingleLocation()
      return
    }
    
    let geofence = Geofence(
      name: name,
      location: location,
      radius: 100,
      enterMessage: enterMessage,
      exitMessage: exitMessage
    )
    addGeofence(geofence)
  }
}

// MARK: - Event Model
struct GeofenceEvent: Equatable {
  enum EventType {
    case enter
    case exit
  }
  
  let type: EventType
  let geofence: Geofence
  let timestamp: Date
}
