/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

//
// StreamSessionViewModel.swift
//
// Core view model demonstrating video streaming from Meta wearable devices using the DAT SDK.
// This class showcases the key streaming patterns: device selection, session management,
// video frame handling, photo capture, and error handling.
//

import MWDATCamera
import MWDATCore
import SwiftUI

enum StreamingStatus {
  case streaming
  case waiting
  case stopped
}

@MainActor
class StreamSessionViewModel: ObservableObject {
  @Published var currentVideoFrame: UIImage?
  @Published var hasReceivedFirstFrame: Bool = false
  @Published var streamingStatus: StreamingStatus = .stopped
  @Published var showError: Bool = false
  @Published var errorMessage: String = ""
  @Published var hasActiveDevice: Bool = false

  var isStreaming: Bool {
    streamingStatus != .stopped
  }

  // Timer properties
  @Published var activeTimeLimit: StreamTimeLimit = .noLimit
  @Published var remainingTime: TimeInterval = 0

  // Photo capture properties
  @Published var capturedPhoto: UIImage?
  @Published var showPhotoPreview: Bool = false
  
  // Backend integration
  private var memoryCaptureManager: MemoryCaptureManager?
  @Published var isUploading: Bool = false
  @Published var uploadStatus: String = ""

  private var timerTask: Task<Void, Never>?
  // The core DAT SDK StreamSession - handles all streaming operations
  private var streamSession: StreamSession
  // Listener tokens are used to manage DAT SDK event subscriptions
  private var stateListenerToken: AnyListenerToken?
  private var videoFrameListenerToken: AnyListenerToken?
  private var errorListenerToken: AnyListenerToken?
  private var photoDataListenerToken: AnyListenerToken?
  private let wearables: WearablesInterface
  private let deviceSelector: AutoDeviceSelector
  private var deviceMonitorTask: Task<Void, Never>?

  // Speech Recognition
  public let speechRecognizer = SpeechRecognizer()
  
  // TTS Manager
  public let ttsManager = TTSManager()
  
  // Query Mode
  public let queryClient = QueryWebSocketClient()
  @Published public var isQuerying: Bool = false
  @Published public var queryStatus: String = ""
  
  private var capturedTranscription: String?
  private var periodicCaptureTask: Task<Void, Never>?

  init(wearables: WearablesInterface) {
    self.wearables = wearables
    // Let the SDK auto-select from available devices
    self.deviceSelector = AutoDeviceSelector(wearables: wearables)
    let config = StreamSessionConfig(
      videoCodec: VideoCodec.raw,
      resolution: StreamingResolution.low,
      frameRate: 24)
    streamSession = StreamSession(streamSessionConfig: config, deviceSelector: deviceSelector)

    // Monitor device availability
    deviceMonitorTask = Task { @MainActor in
      for await device in deviceSelector.activeDeviceStream() {
        self.hasActiveDevice = device != nil
      }
    }

    // Subscribe to session state changes using the DAT SDK listener pattern
    // State changes tell us when streaming starts, stops, or encounters issues
    stateListenerToken = streamSession.statePublisher.listen { [weak self] state in
      Task { @MainActor [weak self] in
        self?.updateStatusFromState(state)
      }
    }

    // Subscribe to video frames from the device camera
    // Each VideoFrame contains the raw camera data that we convert to UIImage
    videoFrameListenerToken = streamSession.videoFramePublisher.listen { [weak self] videoFrame in
      Task { @MainActor [weak self] in
        guard let self else { return }

        if let image = videoFrame.makeUIImage() {
          self.currentVideoFrame = image
          if !self.hasReceivedFirstFrame {
            self.hasReceivedFirstFrame = true
          }
        }
      }
    }

    // Subscribe to streaming errors
    // Errors include device disconnection, streaming failures, etc.
    errorListenerToken = streamSession.errorPublisher.listen { [weak self] error in
      Task { @MainActor [weak self] in
        guard let self else { return }
        let newErrorMessage = formatStreamingError(error)
        if newErrorMessage != self.errorMessage {
          showError(newErrorMessage)
        }
      }
    }

    updateStatusFromState(streamSession.state)

    // Subscribe to photo capture events
    // PhotoData contains the captured image in the requested format (JPEG/HEIC)
    // Subscribe to photo capture events
    photoDataListenerToken = streamSession.photoDataPublisher.listen { [weak self] photoData in
      Task { @MainActor [weak self] in
        guard let self else { return }
        if let uiImage = UIImage(data: photoData.data) {
          self.capturedPhoto = uiImage
          
          // BRANCH 1: Query Mode
          if self.isQuerying {
             self.uploadStatus = "Sending query..."
             let textToSend = self.capturedTranscription ?? self.speechRecognizer.transcribedText
             self.capturedTranscription = nil
             
             do {
               try await self.queryClient.sendQuery(image: uiImage, text: textToSend)
               self.uploadStatus = "Query sent!"
             } catch {
               self.uploadStatus = "Query failed: \(error.localizedDescription)"
               self.ttsManager.speak("Sorry, I couldn't send your question.")
               self.isQuerying = false
               self.startPeriodicCaptureTask()
             }
             return
          }

          // BRANCH 2: Regular Memory Capture
          if let manager = self.memoryCaptureManager {
            self.isUploading = true
            self.uploadStatus = "Uploading to backend..."
            
            // Use the transcription captured during the timer tick, or fallback to current
            var textToSend = self.capturedTranscription ?? self.speechRecognizer.transcribedText
            
            // If transcription is empty, use "(silent)"
            if textToSend.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
              textToSend = "(silent)"
            }
            
            // Clear the captured text now that we've used it
            self.capturedTranscription = nil
            
            await manager.processCapture(photo: uiImage, transcription: textToSend)
            self.isUploading = false
            self.uploadStatus = "Upload complete!"
          }
        }
      }
    }
  }

  func handleStartStreaming() async {
    let permission = Permission.camera
    do {
      let status = try await wearables.checkPermissionStatus(permission)
      if status == .granted {
        await startSession()
        return
      }
      let requestStatus = try await wearables.requestPermission(permission)
      if requestStatus == .granted {
        await startSession()
        return
      }
      showError("Permission denied")
    } catch {
      showError("Permission error: \(error.description)")
    }
  }

  func startSession() async {
    // Reset to unlimited time when starting a new stream
    activeTimeLimit = .noLimit
    remainingTime = 0
    stopTimer()
    
    // Initialize memory capture manager and connect WebSocket
    if memoryCaptureManager == nil {
      // Pass the speech recognizer instance so manager can use it if needed
      memoryCaptureManager = MemoryCaptureManager(userId: "cass", speechRecognizer: speechRecognizer) // TODO: Get from settings
      memoryCaptureManager?.onCaptureComplete = { [weak self] captureId in
        Task { @MainActor [weak self] in
          self?.uploadStatus = "Backend processing: \(captureId)"
        }
      }
      memoryCaptureManager?.onError = { [weak self] error in
        Task { @MainActor [weak self] in
          self?.uploadStatus = "Error: \(error.localizedDescription)"
          self?.isUploading = false
        }
      }
    }
    
    // Start Speech Recognition
    do {
       let authorized = await speechRecognizer.requestAuthorization()
       if authorized {
         try speechRecognizer.startRecognition()
       } else {
         showError("Speech recognition permission denied")
       }
    } catch {
       NSLog("Speech recognition error: \(error)")
    }
    
    do {
    try memoryCaptureManager?.connect()
    setupQueryClient()
    try queryClient.connect()
  } catch {
    NSLog("[StreamSessionViewModel] Failed to connect WebSocket: \(error)")
  }

  await streamSession.start()
    
    // Start the 20-second capture loop
    startPeriodicCaptureTask()
  }

  private func showError(_ message: String) {
    errorMessage = message
    showError = true
  }

  func stopSession() async {
    stopTimer()
    stopPeriodicCaptureTask()
    speechRecognizer.stopRecognition()
    memoryCaptureManager?.disconnect()
    await streamSession.stop()
  }

  func dismissError() {
    showError = false
    errorMessage = ""
  }

  func setTimeLimit(_ limit: StreamTimeLimit) {
    activeTimeLimit = limit
    remainingTime = limit.durationInSeconds ?? 0

    if limit.isTimeLimited {
      startTimer()
    } else {
      stopTimer()
    }
  }

  func capturePhoto() {
    streamSession.capturePhoto(format: .jpeg)
  }
  
  // Periodic Capture Logic (Every 20 seconds)
  private func startPeriodicCaptureTask() {
    stopPeriodicCaptureTask()
    periodicCaptureTask = Task { @MainActor [weak self] in
        while !Task.isCancelled {
            // Wait 20 seconds
            try? await Task.sleep(nanoseconds: 20 * NSEC_PER_SEC)
            guard !Task.isCancelled, let self else { break }
            
            // 1. Capture current text
            let text = self.speechRecognizer.transcribedText
            self.capturedTranscription = text
            
            // 2. Reset text for next turn
            self.speechRecognizer.resetText()
            
            // 3. Trigger Photo Capture (this will invoke the listener above)
            // Note: processCapture inside the listener will use self.capturedTranscription
            self.capturePhoto()
            
            NSLog("[StreamSessionViewModel] 📸 Auto-capture triggered. Text: \(text.prefix(20))...")
        }
    }
  }
  
  private func stopPeriodicCaptureTask() {
    periodicCaptureTask?.cancel()
    periodicCaptureTask = nil
  }

  func dismissPhotoPreview() {
    showPhotoPreview = false
    capturedPhoto = nil
  }

  private func startTimer() {
    stopTimer()
    timerTask = Task { @MainActor [weak self] in
      while let self, remainingTime > 0 {
        try? await Task.sleep(nanoseconds: NSEC_PER_SEC)
        guard !Task.isCancelled else { break }
        remainingTime -= 1
      }
      if let self, !Task.isCancelled {
        await stopSession()
      }
    }
  }

  private func stopTimer() {
    timerTask?.cancel()
    timerTask = nil
  }

  private func updateStatusFromState(_ state: StreamSessionState) {
    switch state {
    case .stopped:
      currentVideoFrame = nil
      streamingStatus = .stopped
    case .waitingForDevice, .starting, .stopping, .paused:
      streamingStatus = .waiting
    case .streaming:
      streamingStatus = .streaming
    }
  }

  private func formatStreamingError(_ error: StreamSessionError) -> String {
    switch error {
    case .internalError:
      return "An internal error occurred. Please try again."
    case .deviceNotFound:
      return "Device not found. Please ensure your device is connected."
    case .deviceNotConnected:
      return "Device not connected. Please check your connection and try again."
    case .timeout:
      return "The operation timed out. Please try again."
    case .videoStreamingError:
      return "Video streaming failed. Please try again."
    case .audioStreamingError:
      return "Audio streaming failed. Please try again."
    case .permissionDenied:
      return "Camera permission denied. Please grant permission in Settings."
    @unknown default:
      return "An unknown streaming error occurred."
    }
  }
  
  // MARK: - Query Handling
  
  private func setupQueryClient() {
    queryClient.onLog = { message in
         NSLog(message)
    }
    
    queryClient.onAnswerReceived = { [weak self] answer in
      Task { @MainActor [weak self] in
        self?.queryStatus = "Response: \(answer)"
        self?.ttsManager.speak(answer)
        self?.isQuerying = false
        // Resume periodic capture if needed
        self?.startPeriodicCaptureTask()
      }
    }
    
    queryClient.onError = { [weak self] error in
      Task { @MainActor [weak self] in
        self?.queryStatus = "Error: \(error.localizedDescription)"
        self?.ttsManager.speak("Sorry, I encountered an error searching your memory.")
        self?.isQuerying = false
        self?.startPeriodicCaptureTask()
      }
    }
  }

  public func startQueryInput() {
    // Stop periodic capture so it doesn't interfere
    stopPeriodicCaptureTask()
    
    // Reset speech recognizer to clear previous ambient noise
    speechRecognizer.resetText()
    
    isQuerying = true
    queryStatus = "Listening..."
    
    // Play a start sound or haptic? (Optional)
  }
  
  public func finishQueryInput() {
    guard isQuerying else { return }
    queryStatus = "Processing query..."
    
    // Capture the query text *before* photo capture just in case
    // We will use this in the photo listener
    capturedTranscription = speechRecognizer.transcribedText
    
    // Trigger photo capture. The actual upload logic will happen in the listener
    // when the photo data arrives.
    capturePhoto()
  }
}
