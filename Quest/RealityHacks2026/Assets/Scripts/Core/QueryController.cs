using System;
using System.Collections;
using UnityEngine;
using RealityHacks.Audio;
using RealityHacks.Input;
using RealityHacks.Network;
using RealityHacks.UI;

namespace RealityHacks.Core
{
    public class QueryController : MonoBehaviour
    {
        [Header("Component References")]
        [SerializeField] private QueryWebSocketClient webSocketClient;
        [SerializeField] private MicrophoneManager microphoneManager;
        [SerializeField] private VRInputManager inputManager;
        [SerializeField] private DebugTerminal debugTerminal;
        [SerializeField] private MicrophoneStatusIndicator micStatusIndicator;
        [SerializeField] private SpeechToTextHandler speechToText;
        [SerializeField] private QueryAudioManager audioManager;
        [SerializeField] private AudioPlaybackIndicator audioIndicator;

        [Header("Configuration")]
        [SerializeField] private bool autoConnectOnStart = true;
        [SerializeField] private float reconnectDelay = 5f;

        private bool isProcessingQuery = false;
        private float[] lastAudioData;
        private Coroutine reconnectCoroutine;

        private void Start()
        {
            LogStartupBanner();
            InitializeComponents();
            ValidateConfiguration();
            SubscribeToEvents();

            if (autoConnectOnStart)
            {
                webSocketClient.Connect();
            }
        }

        private void LogStartupBanner()
        {
            Debug.Log("===========================================");
            Debug.Log("[RealityHacks] Query System Starting...");
            Debug.Log("===========================================");
        }

        private void InitializeComponents()
        {
            Debug.Log("[RealityHacks] Initializing components...");
            
            if (webSocketClient == null)
                webSocketClient = GetComponentInChildren<QueryWebSocketClient>();
            if (microphoneManager == null)
                microphoneManager = GetComponentInChildren<MicrophoneManager>();
            if (inputManager == null)
                inputManager = GetComponentInChildren<VRInputManager>();
            if (debugTerminal == null)
                debugTerminal = GetComponentInChildren<DebugTerminal>();
            if (micStatusIndicator == null)
                micStatusIndicator = GetComponentInChildren<MicrophoneStatusIndicator>();
            if (speechToText == null)
                speechToText = GetComponentInChildren<SpeechToTextHandler>();
            if (audioManager == null)
                audioManager = GetComponentInChildren<QueryAudioManager>();
            if (audioIndicator == null)
                audioIndicator = GetComponentInChildren<AudioPlaybackIndicator>();
        }

        private void ValidateConfiguration()
        {
            Debug.Log("[RealityHacks] === CONFIGURATION STATUS ===");
            
            // WebSocket Client
            if (webSocketClient != null)
            {
                Debug.Log($"[RealityHacks] ✓ WebSocketClient: FOUND");
                Debug.Log($"[RealityHacks]   Server: {webSocketClient.GetServerInfo()}");
            }
            else
            {
                Debug.LogError("[RealityHacks] ✗ WebSocketClient: MISSING - Cannot send queries!");
            }

            // Microphone Manager
            if (microphoneManager != null)
            {
                Debug.Log($"[RealityHacks] ✓ MicrophoneManager: FOUND");
                Debug.Log($"[RealityHacks]   Mic Available: {microphoneManager.IsMicrophoneAvailable}");
            }
            else
            {
                Debug.LogError("[RealityHacks] ✗ MicrophoneManager: MISSING - Cannot record audio!");
            }

            // Input Manager
            if (inputManager != null)
            {
                Debug.Log($"[RealityHacks] ✓ VRInputManager: FOUND");
                Debug.Log($"[RealityHacks]   Input Actions Configured: {inputManager.AreActionsConfigured()}");
            }
            else
            {
                Debug.LogError("[RealityHacks] ✗ VRInputManager: MISSING - No controller input!");
            }

            // Debug Terminal
            if (debugTerminal != null)
            {
                Debug.Log($"[RealityHacks] ✓ DebugTerminal: FOUND");
            }
            else
            {
                Debug.LogWarning("[RealityHacks] ⚠ DebugTerminal: MISSING - No visual logging");
            }

            // Mic Status Indicator
            if (micStatusIndicator != null)
            {
                Debug.Log($"[RealityHacks] ✓ MicStatusIndicator: FOUND");
            }
            else
            {
                Debug.LogWarning("[RealityHacks] ⚠ MicStatusIndicator: MISSING - No mic status UI");
            }

            // Speech-to-Text
            if (speechToText != null)
            {
                Debug.Log($"[RealityHacks] ✓ SpeechToText: FOUND");
                Debug.Log($"[RealityHacks]   API Key Configured: {speechToText.IsApiKeyConfigured()}");
            }
            else
            {
                Debug.LogWarning("[RealityHacks] ⚠ SpeechToText: MISSING - Will send test queries instead");
            }

            // Audio Manager
            if (audioManager != null)
            {
                Debug.Log($"[RealityHacks] ✓ QueryAudioManager: FOUND");
                if (audioIndicator != null)
                {
                    audioIndicator.Initialize(audioManager);
                    Debug.Log($"[RealityHacks] ✓ AudioPlaybackIndicator: FOUND");
                }
            }
            else
            {
                Debug.LogWarning("[RealityHacks] ⚠ QueryAudioManager: MISSING - No TTS audio playback");
            }

            Debug.Log("[RealityHacks] ================================");
        }

        private void SubscribeToEvents()
        {
            // Input events
            if (inputManager != null)
            {
                inputManager.OnRightTriggerPressed += HandleRightTriggerPressed;
                inputManager.OnRightTriggerReleased += HandleRightTriggerReleased;
                inputManager.OnLeftJoystickHeldComplete += HandleLeftJoystickHeld;
                inputManager.OnLeftJoystickHoldProgress += HandleJoystickHoldProgress;
            }

            // WebSocket events
            if (webSocketClient != null)
            {
                webSocketClient.OnConnected += HandleConnected;
                webSocketClient.OnDisconnected += HandleDisconnected;
                webSocketClient.OnMessageReceived += HandleMessageReceived;
                webSocketClient.OnQueryResponse += HandleQueryResponse;
                webSocketClient.OnError += HandleError;
            }

            // Microphone events
            if (microphoneManager != null)
            {
                microphoneManager.OnRecordingStarted += HandleRecordingStarted;
                microphoneManager.OnRecordingStopped += HandleRecordingStopped;
                microphoneManager.OnAudioDataReady += HandleAudioDataReady;
                microphoneManager.OnStatusChanged += HandleMicStatusChanged;
            }

            // Speech-to-text events
            if (speechToText != null)
            {
                speechToText.OnTranscriptionComplete += HandleTranscriptionComplete;
                speechToText.OnTranscriptionError += HandleTranscriptionError;
            }
        }

        private void HandleRightTriggerPressed()
        {
            Debug.Log("[QueryController] >>> A BUTTON PRESSED - HandleRightTriggerPressed called");
            
            if (isProcessingQuery)
            {
                Debug.Log("[QueryController] Blocked: Already processing query");
                LogToTerminal("[STATUS] Already processing a query, please wait...");
                return;
            }

            if (!webSocketClient.IsConnected)
            {
                Debug.Log("[QueryController] Not connected, attempting to connect...");
                LogToTerminal("[WARNING] Not connected to server. Attempting to connect...");
                webSocketClient.Connect();
                return;
            }

            // Stop any playing audio when starting a new query
            if (audioManager != null)
            {
                audioManager.StopAudio();
            }

            Debug.Log("[QueryController] Starting microphone recording...");
            microphoneManager.StartRecording();
        }

        private void HandleRightTriggerReleased()
        {
            Debug.Log("[QueryController] >>> A BUTTON RELEASED - HandleRightTriggerReleased called");
            
            if (microphoneManager.IsRecording)
            {
                Debug.Log("[QueryController] Stopping microphone recording...");
                microphoneManager.StopRecording();
            }
            else
            {
                Debug.Log("[QueryController] Microphone was not recording");
            }
        }

        private void HandleLeftJoystickHeld()
        {
            Debug.Log("[QueryController] >>> B BUTTON PRESSED - HandleLeftJoystickHeld called");
            
            if (debugTerminal != null)
            {
                debugTerminal.Toggle();
            }
        }

        private void HandleJoystickHoldProgress(float progress)
        {
            // Could add visual feedback for hold progress here
        }

        private void HandleConnected()
        {
            LogToTerminal("[CONNECTED] Successfully connected to backend server");
            UpdateMicStatus();
            
            if (reconnectCoroutine != null)
            {
                StopCoroutine(reconnectCoroutine);
                reconnectCoroutine = null;
            }
        }

        private void HandleDisconnected()
        {
            LogToTerminal("[DISCONNECTED] Lost connection to server");
            UpdateMicStatus();
            
            // Auto-reconnect
            if (reconnectCoroutine == null)
            {
                reconnectCoroutine = StartCoroutine(AttemptReconnect());
            }
        }

        private IEnumerator AttemptReconnect()
        {
            while (!webSocketClient.IsConnected)
            {
                LogToTerminal($"[STATUS] Attempting reconnect in {reconnectDelay} seconds...");
                yield return new WaitForSeconds(reconnectDelay);
                
                if (!webSocketClient.IsConnected)
                {
                    webSocketClient.Connect();
                }
            }
            reconnectCoroutine = null;
        }

        private void HandleMessageReceived(string message)
        {
            LogToTerminal(message);
        }

        private void HandleQueryResponse(QueryResponse response)
        {
            isProcessingQuery = false;

            if (response.type == "response" && response.ok)
            {
                LogToTerminal($"[ANSWER] {response.answer}");
                if (!string.IsNullOrEmpty(response.suggestedFollowUp))
                {
                    LogToTerminal($"[SUGGESTION] {response.suggestedFollowUp}");
                }

                // Play TTS audio if available
                Debug.Log($"[QueryController] Audio check - audioURL: '{response.audioURL}', audioManager: {(audioManager != null ? "SET" : "NULL")}");
                if (string.IsNullOrEmpty(response.audioURL))
                {
                    LogToTerminal("[AUDIO] No audio URL in response");
                }
                else if (audioManager == null)
                {
                    LogToTerminal("[AUDIO] ERROR: QueryAudioManager not configured!");
                    Debug.LogError("[QueryController] QueryAudioManager is null - add it to the scene!");
                }
                else
                {
                    LogToTerminal($"[AUDIO] Playing: {response.audioURL}");
                    _ = audioManager.PlayResponseAudio(response.audioURL);
                }
            }
            else if (response.type == "clarification_needed")
            {
                LogToTerminal($"[CLARIFICATION] {response.message}");
                if (response.options != null)
                {
                    for (int i = 0; i < response.options.Length; i++)
                    {
                        LogToTerminal($"  {i + 1}. {response.options[i]}");
                    }
                }
            }
            else if (response.type == "error")
            {
                LogToTerminal($"[ERROR] {response.error}: {response.detail}");
            }
        }

        private void HandleError(string error)
        {
            LogToTerminal($"[ERROR] {error}");
            isProcessingQuery = false;
        }

        private void HandleRecordingStarted()
        {
            LogToTerminal("[MIC] Recording started - speak your query");
            UpdateMicStatus();
        }

        private void HandleRecordingStopped()
        {
            LogToTerminal("[MIC] Recording stopped - processing audio...");
            UpdateMicStatus();
        }

        private void HandleAudioDataReady(float[] audioData)
        {
            lastAudioData = audioData;
            isProcessingQuery = true;

            if (speechToText != null)
            {
                byte[] wavData = microphoneManager.GetAudioAsWavBytes(audioData);
                speechToText.TranscribeAudio(wavData);
            }
            else
            {
                // Fallback: send a test query if no STT available
                LogToTerminal("[WARNING] No speech-to-text configured. Sending test query.");
                webSocketClient.SendQuery("Test query from VR headset");
                isProcessingQuery = false;
            }
        }

        private void HandleMicStatusChanged(string status)
        {
            LogToTerminal($"[MIC] {status}");
        }

        private void HandleTranscriptionComplete(string transcription)
        {
            LogToTerminal($"[TRANSCRIPTION] \"{transcription}\"");
            
            if (!string.IsNullOrWhiteSpace(transcription))
            {
                webSocketClient.SendQuery(transcription);
            }
            else
            {
                LogToTerminal("[WARNING] Empty transcription, query not sent");
                isProcessingQuery = false;
            }
        }

        private void HandleTranscriptionError(string error)
        {
            LogToTerminal($"[STT ERROR] {error}");
            isProcessingQuery = false;
        }

        private void UpdateMicStatus()
        {
            if (micStatusIndicator != null)
            {
                micStatusIndicator.SetConnectionState(webSocketClient.IsConnected);
                micStatusIndicator.SetRecordingState(microphoneManager.IsRecording);
            }
        }

        private void LogToTerminal(string message)
        {
            if (debugTerminal != null)
            {
                debugTerminal.Log(message);
            }
            Debug.Log($"[QueryController] {message}");
        }

        public void ManualConnect()
        {
            webSocketClient.Connect();
        }

        public void ManualDisconnect()
        {
            webSocketClient.Disconnect();
        }

        public void SendTextQuery(string text)
        {
            if (webSocketClient.IsConnected)
            {
                webSocketClient.SendQuery(text);
            }
        }

        private void OnDestroy()
        {
            // Unsubscribe from events
            if (inputManager != null)
            {
                inputManager.OnRightTriggerPressed -= HandleRightTriggerPressed;
                inputManager.OnRightTriggerReleased -= HandleRightTriggerReleased;
                inputManager.OnLeftJoystickHeldComplete -= HandleLeftJoystickHeld;
                inputManager.OnLeftJoystickHoldProgress -= HandleJoystickHoldProgress;
            }

            if (webSocketClient != null)
            {
                webSocketClient.OnConnected -= HandleConnected;
                webSocketClient.OnDisconnected -= HandleDisconnected;
                webSocketClient.OnMessageReceived -= HandleMessageReceived;
                webSocketClient.OnQueryResponse -= HandleQueryResponse;
                webSocketClient.OnError -= HandleError;
            }

            if (microphoneManager != null)
            {
                microphoneManager.OnRecordingStarted -= HandleRecordingStarted;
                microphoneManager.OnRecordingStopped -= HandleRecordingStopped;
                microphoneManager.OnAudioDataReady -= HandleAudioDataReady;
                microphoneManager.OnStatusChanged -= HandleMicStatusChanged;
            }

            if (speechToText != null)
            {
                speechToText.OnTranscriptionComplete -= HandleTranscriptionComplete;
                speechToText.OnTranscriptionError -= HandleTranscriptionError;
            }
        }
    }
}
