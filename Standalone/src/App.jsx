/**
 * AR Alzheimer Assistant - Main Application
 * WebXR application for Meta Quest 3
 * 
 * Features:
 * - Voice recording with 20-minute chunks
 * - Auto-capture screenshots
 * - OpenAI transcription and summarization
 * - AR timeline display
 * - Korean voice commands
 * - TTS: reads summaries aloud
 * - Auto-cycle: continuous record → capture → show → repeat
 */

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { createXRStore, XR } from '@react-three/xr';
import { Environment, Text } from '@react-three/drei';

// Hooks
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { useVoiceCommand } from './hooks/useVoiceCommand';
import { useAutoCapture } from './hooks/useAutoCapture';
import { useTTS } from './hooks/useTTS';

// Components
import { Timeline } from './components/Timeline';
import { RecordingIndicator } from './components/RecordingIndicator';
import { VoiceCommandFeedback } from './components/VoiceCommandFeedback';
import { PhotoOverlay } from './components/PhotoOverlay';
import { ARControlPanel } from './components/ARControlPanel';
import { ARPhotoDisplay } from './components/ARPhotoDisplay';
import { DebugPanel } from './components/DebugPanel';

// Services
import { testAPIConnection } from './services/openai';

// Styles
import './App.css';

// Create XR store for WebXR session management
const xrStore = createXRStore({
  depthSensing: true,
  optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
});

/**
 * AR Scene - Contains all 3D elements
 */
function ARScene({
  timeline,
  isRecording,
  isProcessing,
  lastCommand,
  isListening,
  isSpeaking,
  autoCycleEnabled,
  showingPhoto, // Added Prop
  currentEntry, // Added Prop
  onStartRecording,
  onStopRecording,
  onStartAutoCycle,
  onStopAutoCycle
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />

      {/* Environment for better visuals */}
      <Environment preset="city" />

      {/* Timeline display */}
      <Timeline entries={timeline} />

      {/* Recording indicator */}
      <RecordingIndicator
        isRecording={isRecording}
        isProcessing={isProcessing}
      />

      {/* Voice command feedback */}
      <VoiceCommandFeedback
        lastCommand={lastCommand}
        isListening={isListening}
      />

      {/* TTS Speaking indicator */}
      {isSpeaking && (
        <Text
          position={[0, 1.9, -1.5]}
          fontSize={0.05}
          color="#22c55e"
        >
          🔊 Speaking...
        </Text>
      )}

      {/* AR Control Panel - interactive controls in AR */}
      <ARControlPanel
        isRecording={isRecording}
        isProcessing={isProcessing}
        autoCycleEnabled={autoCycleEnabled}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
        onStartAutoCycle={onStartAutoCycle}
        onStopAutoCycle={onStopAutoCycle}
      />

      {/* AR Photo Display - Holographic Frame */}
      <ARPhotoDisplay
        isVisible={showingPhoto}
        photoUrl={currentEntry?.photo}
        caption={currentEntry?.summary}
      />

      {/* Floor reference (helpful in AR) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color="#1a1a1a"
          transparent
          opacity={0.1}
        />
      </mesh>
    </>
  );
}

/**
 * Loading fallback for Suspense
 */
function LoadingFallback() {
  return (
    <Text position={[0, 1.5, -2]} fontSize={0.1} color="white">
      Loading...
    </Text>
  );
}

/**
 * Main App Component
 */
function App() {
  // State
  const [apiStatus, setApiStatus] = useState(null);
  const [error, setError] = useState(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [autoCycleEnabled, setAutoCycleEnabled] = useState(false);
  const [showingPhoto, setShowingPhoto] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [language, setLanguage] = useState('auto'); // auto, ko, en, zh

  const autoCycleRef = useRef(false);
  // Ref to break circular dependency between callback and hook
  const autoCaptureControls = useRef({
    pauseCapture: () => { },
    resumeCapture: () => { }
  });

  // TTS hook
  const tts = useTTS();

  // Custom hooks
  const voiceRecorder = useVoiceRecorder();

  // Handle new entry - stop recording, read aloud, show photo, then restart
  const handleNewEntry = useCallback((entry) => {
    setCurrentEntry(entry);

    if (ttsEnabled && entry?.summary) {
      // Pause recording and auto-capture timer during TTS
      if (autoCycleRef.current) {
        // Pause data collection during TTS
        voiceRecorder.pauseRecording();
        autoCaptureControls.current.pauseCapture();
        console.log('Auto-cycle: Paused data collection for TTS');
      }

      setShowingPhoto(true);

      // Speak summary with callback to restart recording after TTS ends
      tts.speakSummary(entry.summary, {
        onEnd: () => {
          console.log('TTS finished, restarting cycle...');

          // Close immediately after speech ends
          setShowingPhoto(false);

          // Resume recording if auto-cycle is enabled
          if (autoCycleRef.current) {
            // Buffer is cleared by getCurrentAudioBlob, so just resume collection
            if (voiceRecorder.isRecording) {
              voiceRecorder.resumeRecording();
            } else {
              // Initial start if needed
              voiceRecorder.startRecording();
            }
            autoCaptureControls.current.resumeCapture();
          }
        }
      });
    }
  }, [ttsEnabled, tts, voiceRecorder]);

  const autoCapture = useAutoCapture({
    voiceRecorder,
    onNewEntry: handleNewEntry
  });

  // Sync controls to ref
  useEffect(() => {
    if (autoCapture) {
      autoCaptureControls.current = {
        pauseCapture: autoCapture.pauseCapture,
        resumeCapture: autoCapture.resumeCapture
      };
    }
  }, [autoCapture.pauseCapture, autoCapture.resumeCapture]);

  // Handle photo overlay complete - restart recording if auto-cycle
  const handlePhotoComplete = useCallback(() => {
    setShowingPhoto(false);

    // If auto-cycle is enabled, restart the recording
    if (autoCycleRef.current) {
      console.log('Auto-cycle: Photo complete, ensuring recording continues...');
    }
  }, []);

  // Voice command handlers
  const handleVoiceStart = useCallback(async () => {
    console.log('Starting voice recording...');
    await voiceRecorder.startRecording();
    autoCapture.startCapture();
  }, [voiceRecorder, autoCapture]);

  const handleVoiceStop = useCallback(() => {
    voiceRecorder.stopRecording();
    autoCapture.stopCapture();
    setAutoCycleEnabled(false);
    autoCycleRef.current = false;
  }, [voiceRecorder, autoCapture]);

  const voiceCommand = useVoiceCommand({
    onStart: handleVoiceStart,
    onStop: handleVoiceStop
  });

  // Test API connection on mount
  useEffect(() => {
    testAPIConnection().then(setApiStatus);
  }, []);

  // Handle Enter XR button
  const handleEnterXR = async () => {
    try {
      await xrStore.enterAR();
    } catch (err) {
      console.error('Failed to enter AR:', err);
      setError('AR 모드 진입 실패. 브라우저가 WebXR을 지원하는지 확인하세요.');
    }
  };

  // Toggle recording
  const toggleRecording = () => {
    if (voiceRecorder.isRecording) {
      handleVoiceStop();
    } else {
      handleVoiceStart();
    }
  };

  // Toggle voice command listening
  const toggleVoiceCommand = () => {
    if (voiceCommand.isListening) {
      voiceCommand.stopListening();
    } else {
      voiceCommand.startListening();
    }
  };

  // Start auto-cycle mode
  const startAutoCycle = async () => {
    setAutoCycleEnabled(true);
    autoCycleRef.current = true;
    await handleVoiceStart();
    console.log('Auto-cycle mode started: 녹음 → 캡처 → 읽기 → 사진 → 반복');
  };

  // Stop auto-cycle mode
  const stopAutoCycle = () => {
    setAutoCycleEnabled(false);
    autoCycleRef.current = false;
    handleVoiceStop();
    setShowingPhoto(false);
    console.log('Auto-cycle mode stopped');
  };

  // Test TTS
  const testTTS = () => {
    tts.speak('Hello. This is a voice test.');
  };

  return (
    <div className="app-container">
      {/* Debug Panel - visible in regular view */}
      <DebugPanel voiceCommand={voiceCommand} voiceRecorder={voiceRecorder} />

      {/* Photo Overlay - shows during TTS */}
      <PhotoOverlay
        entry={currentEntry}
        isVisible={showingPhoto}
        onComplete={handlePhotoComplete}
      />

      {/* Control Panel */}
      <div className="control-panel">
        <h1 className="app-title">🧠 AR Memory Assistant</h1>
        <p className="app-subtitle">AR Assistant for Alzheimer's Patients</p>

        {/* API Status */}
        <div className={`status-badge ${apiStatus?.success ? 'success' : 'error'}`}>
          {apiStatus?.success ? '✅ API Connected' : '⚠️ API Not Connected'}
        </div>

        {/* Error display */}
        {error && (
          <div className="error-message">{error}</div>
        )}

        {/* Main controls */}
        <div className="button-group">
          {/* Auto-cycle button - main feature */}
          <button
            className={`btn ${autoCycleEnabled ? 'btn-danger' : 'btn-primary'}`}
            onClick={autoCycleEnabled ? stopAutoCycle : startAutoCycle}
            style={{ fontSize: '1.1rem', padding: '16px 24px' }}
          >
            {autoCycleEnabled ? '⏹️ Stop Auto Mode' : '🔄 Start Auto Mode'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleEnterXR}
          >
            🥽 Enter AR
          </button>

          <button
            className={`btn ${voiceRecorder.isRecording ? 'btn-danger' : 'btn-success'}`}
            onClick={toggleRecording}
          >
            {voiceRecorder.isRecording ? '⏹️ Stop Recording' : '🎙️ Start Recording'}
          </button>

          <button
            className={`btn ${voiceCommand.isListening ? 'btn-active' : 'btn-secondary'}`}
            onClick={toggleVoiceCommand}
            disabled={!voiceCommand.isSupported}
          >
            {voiceCommand.isListening ? '🎤 Voice Active' : '🎤 Voice Command'}
          </button>
        </div>

        {/* Demo mode controls */}
        <div className="demo-controls">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={autoCapture.useDemoData}
              onChange={(e) => autoCapture.toggleDemoMode(e.target.checked)}
            />
            <span>Demo Mode (Use sample data)</span>
          </label>

          {/* Language selector */}
          <div className="language-selector">
            <label>🌐 Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-dropdown"
            >
              <option value="auto">🔄 Auto Detect</option>
              <option value="ko">🇰🇷 Korean</option>
              <option value="en">🇺🇸 English</option>
              <option value="zh">🇨🇳 Chinese</option>
            </select>
          </div>

          <label className="toggle-label">
            <input
              type="checkbox"
              checked={ttsEnabled}
              onChange={(e) => setTtsEnabled(e.target.checked)}
            />
            <span>🔊 Text-to-Speech {tts.isSpeaking ? '(Speaking...)' : ''}</span>
          </label>

          <button
            className="btn btn-small"
            onClick={autoCapture.captureNow}
          >
            📸 Manual Capture
          </button>

          <button
            className="btn btn-small"
            onClick={testTTS}
            disabled={!tts.isSupported}
          >
            🔊 Test TTS
          </button>

          <button
            className="btn btn-small btn-outline"
            onClick={autoCapture.clearTimeline}
          >
            🗑️ Clear Timeline
          </button>
        </div>

        {/* Status info */}
        <div className="status-info">
          <p>Mode: {autoCycleEnabled ? '🔄 Auto Cycle' : 'Manual'}</p>
          <p>Recording: {voiceRecorder.isRecording ? '🔴 Recording' : '⚫ Idle'}</p>
          <p>Chunks: {voiceRecorder.chunkCount}</p>
          <p>Timeline entries: {autoCapture.timeline.length}</p>
          {autoCapture.lastCaptureTime && (
            <p>Last capture: {autoCapture.lastCaptureTime.toLocaleTimeString()}</p>
          )}
        </div>

        {/* Voice recorder errors */}
        {voiceRecorder.error && (
          <div className="error-message">{voiceRecorder.error}</div>
        )}

        {/* Voice command errors */}
        {voiceCommand.error && (
          <div className="error-message">{voiceCommand.error}</div>
        )}
      </div>

      {/* WebXR Canvas */}
      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 1.6, 0], fov: 75 }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <XR store={xrStore}>
            <Suspense fallback={<LoadingFallback />}>
              <ARScene
                timeline={autoCapture.timeline}
                isRecording={voiceRecorder.isRecording}
                isProcessing={autoCapture.isProcessing}
                lastCommand={voiceCommand.lastCommand}
                isListening={voiceCommand.isListening}
                isSpeaking={showingPhoto} // Use showingPhoto as sync for speaking status
                autoCycleEnabled={autoCycleEnabled}
                showingPhoto={showingPhoto}
                currentEntry={currentEntry}
                onStartRecording={handleVoiceStart}
                onStopRecording={handleVoiceStop}
                onStartAutoCycle={startAutoCycle}
                onStopAutoCycle={stopAutoCycle}
              />
            </Suspense>
          </XR>
        </Canvas>
      </div>

      {/* Instructions overlay */}
      <div className="instructions">
        <h3>📖 How to Use</h3>
        <ul>
          <li>🔄 <strong>Auto Mode</strong> - Record → Capture → Read → Show photo (repeat)</li>
          <li>🎙️ "Start Recording" - Voice command to start</li>
          <li>⏹️ "Stop Recording" - Voice command to stop</li>
          <li>🥽 Click Enter AR on Quest 3</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
