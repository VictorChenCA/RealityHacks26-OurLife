/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

//
// TTSManager.swift
//
// Text-to-Speech manager for Ray-Ban glasses audio output.
// Handles voice prompts, reminders, and responses.
//

import AVFoundation
import Foundation

@MainActor
class TTSManager: NSObject, ObservableObject, AVSpeechSynthesizerDelegate {
  private let synthesizer = AVSpeechSynthesizer()
  @Published var isSpeaking: Bool = false
  
  override init() {
    super.init()
    synthesizer.delegate = self
    
    // Configure Audio Session for playback mixed with other audio (like the camera stream)
    do {
      let audioSession = AVAudioSession.sharedInstance()
      try audioSession.setCategory(.playAndRecord, options: [.mixWithOthers, .allowBluetooth, .defaultToSpeaker])
      try audioSession.setActive(true)
      NSLog("[TTSManager] Audio session configured with mixWithOthers")
    } catch {
      NSLog("[TTSManager] Failed to configure audio session: \(error)")
    }
  }
  
  /// Speak text through Ray-Ban speakers
  /// - Parameters:
  ///   - text: The text to speak
  ///   - rate: Speech rate (0.0-1.0, default 0.5)
  ///   - pitch: Pitch (0.5-2.0, default 1.0)
  ///   - volume: Volume (0.0-1.0, default 1.0)
  func speak(_ text: String, rate: Float = 0.5, pitch: Float = 1.0, volume: Float = 1.0) {
    NSLog("[TTSManager] Speaking: \(text)")
    
    let utterance = AVSpeechUtterance(string: text)
    utterance.rate = rate
    utterance.pitchMultiplier = pitch
    utterance.volume = volume
    utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
    
    synthesizer.speak(utterance)
  }
  
  /// Stop current speech
  func stop() {
    synthesizer.stopSpeaking(at: .immediate)
  }
  
  // MARK: - AVSpeechSynthesizerDelegate
  
  func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didStart utterance: AVSpeechUtterance) {
    isSpeaking = true
    NSLog("[TTSManager] Started speaking")
  }
  
  func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
    isSpeaking = false
    NSLog("[TTSManager] Finished speaking")
  }
  
  func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
    isSpeaking = false
    NSLog("[TTSManager] Cancelled speaking")
  }
}
