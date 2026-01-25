/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

//
// StreamView.swift
//
// Main UI for video streaming from Meta wearable devices using the DAT SDK.
// This view demonstrates the complete streaming API: video streaming with real-time display, photo capture,
// and error handling.
//

import MWDATCore
import SwiftUI

struct StreamView: View {
  @ObservedObject var viewModel: StreamSessionViewModel
  @ObservedObject var wearablesVM: WearablesViewModel

  var body: some View {
    ZStack {
      // Black background for letterboxing/pillarboxing
      Color.black
        .edgesIgnoringSafeArea(.all)

      // Video backdrop
      if let videoFrame = viewModel.currentVideoFrame, viewModel.hasReceivedFirstFrame {
        GeometryReader { geometry in
          Image(uiImage: videoFrame)
            .resizable()
            .aspectRatio(contentMode: .fill)
            .frame(width: geometry.size.width, height: geometry.size.height)
            .clipped()
        }
        .edgesIgnoringSafeArea(.all)
      } else {
        ProgressView()
          .scaleEffect(1.5)
          .foregroundColor(.white)
      }

      // TTS Test Controls Overlay
      VStack {
        HStack(spacing: 12) {
          Spacer()
          Button(action: {
            viewModel.ttsManager.speak("Testing audio output one.")
          }) {
            Image(systemName: "speaker.wave.2.fill")
              .foregroundColor(.white)
              .padding(8)
              .background(Color.black.opacity(0.6))
              .clipShape(Circle())
          }
          
          Button(action: {
            viewModel.ttsManager.speak("Hey cass, don't forget to take your keys.")
          }) {
            Image(systemName: "exclamationmark.bubble.fill")
              .foregroundColor(.white)
              .padding(8)
              .background(Color.black.opacity(0.6))
              .clipShape(Circle())
          }
          
          Button(action: {
            viewModel.ttsManager.speak("This is a longer test sentence to check the rate.")
          }) {
            Image(systemName: "text.bubble.fill")
              .foregroundColor(.white)
              .padding(8)
              .background(Color.black.opacity(0.6))
              .clipShape(Circle())
          }
        }
        .padding(.top, 50)
        .padding(.trailing, 20)
        
        Spacer()
      }

      
      // Bottom controls layer
      VStack {
        Spacer()
        ControlsView(viewModel: viewModel)
      }
      .padding(.all, 24)
      
      // Query Status Overlay
      VStack {
        if !viewModel.queryStatus.isEmpty {
           Text(viewModel.queryStatus)
             .font(.headline)
             .padding()
             .background(Color.black.opacity(0.7))
             .foregroundColor(.white)
             .cornerRadius(12)
             .padding(.top, 100)
             .transition(.opacity)
        }
        Spacer()
      }

      // Top Middle Query Button
      VStack {
        HStack {
            Spacer()
            // Using DragGesture for reliable TouchDown/TouchUp behavior
            ZStack {
                Circle()
                   .fill(viewModel.isQuerying ? Color.red : Color.blue)
                   .frame(width: 80, height: 80)
                   .shadow(color: .black.opacity(0.3), radius: 8, x: 0, y: 4)
                   .scaleEffect(viewModel.isQuerying ? 1.2 : 1.0)
                   .animation(.spring(response: 0.3, dampingFraction: 0.6), value: viewModel.isQuerying)
                   
                Image(systemName: "questionmark")
                   .font(.system(size: 40, weight: .bold))
                   .foregroundColor(.white)
            }
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in
                        if !viewModel.isQuerying {
                            let generator = UIImpactFeedbackGenerator(style: .medium)
                            generator.impactOccurred()
                            viewModel.startQueryInput()
                        }
                    }
                    .onEnded { _ in
                        let generator = UIImpactFeedbackGenerator(style: .medium)
                        generator.impactOccurred()
                        viewModel.finishQueryInput()
                    }
            )
            Spacer()
        }
        .padding(.top, 120) // Position below TTS controls
        Spacer()
      }
      
      // Transcription overlay
      VStack {
        Spacer()
        
        if viewModel.isProcessingQuery {
             ProgressView()
               .progressViewStyle(CircularProgressViewStyle(tint: .white))
               .scaleEffect(1.5)
               .padding(12)
               .background(Color.black.opacity(0.7))
               .cornerRadius(12)
               .padding(.bottom, 100)
        } else if !viewModel.speechRecognizer.transcribedText.isEmpty {
          Text(viewModel.speechRecognizer.transcribedText)
            .font(.system(size: 14))
            .foregroundColor(.white)
            .padding(12)
            .background(Color.black.opacity(0.7))
            .cornerRadius(8)
            .padding(.horizontal, 20)
            .padding(.bottom, 100)
        }
      }
      
      // Timer display area with fixed height
      VStack {
        Spacer()
        if viewModel.activeTimeLimit.isTimeLimited && viewModel.remainingTime > 0 {
          Text("Streaming ending in \(viewModel.remainingTime.formattedCountdown)")
            .font(.system(size: 15))
            .foregroundColor(.white)
        }
      }
    }
    .onDisappear {
      Task {
        if viewModel.streamingStatus != .stopped {
          await viewModel.stopSession()
        }
      }
    }
    // Show captured photos from DAT SDK in a preview sheet
    .sheet(isPresented: $viewModel.showPhotoPreview) {
      if let photo = viewModel.capturedPhoto {
        PhotoPreviewView(
          photo: photo,
          onDismiss: {
            viewModel.dismissPhotoPreview()
          }
        )
      }
    }
  }
}

// Extracted controls for clarity
struct ControlsView: View {
  @ObservedObject var viewModel: StreamSessionViewModel
  var body: some View {
    // Controls row
    HStack(spacing: 8) {
      CustomButton(
        title: "Stop streaming",
        style: .destructive,
        isDisabled: false
      ) {
        Task {
          await viewModel.stopSession()
        }
      }

      // Timer button
      CircleButton(
        icon: "timer",
        text: viewModel.activeTimeLimit != .noLimit ? viewModel.activeTimeLimit.displayText : nil
      ) {
        let nextTimeLimit = viewModel.activeTimeLimit.next
        viewModel.setTimeLimit(nextTimeLimit)
      }

      // Photo button
      CircleButton(icon: "camera.fill", text: nil) {
        viewModel.capturePhoto()
      }
    }
  }
}
