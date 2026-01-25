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

        [Header("Configuration")]
        [SerializeField] private bool autoConnectOnStart = true;
        [SerializeField] private float reconnectDelay = 5f;

        private bool isProcessingQuery = false;
        private float[] lastAudioData;
        private Coroutine reconnectCoroutine;

        private void Start()
        {
            InitializeComponents();
            SubscribeToEvents();

            if (autoConnectOnStart)
            {
                webSocketClient.Connect();
            }
        }

        private void InitializeComponents()
        {
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
            if (isProcessingQuery)
            {
                LogToTerminal("[STATUS] Already processing a query, please wait...");
                return;
            }

            if (!webSocketClient.IsConnected)
            {
                LogToTerminal("[WARNING] Not connected to server. Attempting to connect...");
                webSocketClient.Connect();
                return;
            }

            microphoneManager.StartRecording();
        }

        private void HandleRightTriggerReleased()
        {
            if (microphoneManager.IsRecording)
            {
                microphoneManager.StopRecording();
            }
        }

        private void HandleLeftJoystickHeld()
        {
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
