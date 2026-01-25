using UnityEngine;

namespace RealityHacks.Core
{
    [CreateAssetMenu(fileName = "AppConfig", menuName = "RealityHacks/App Configuration")]
    public class AppConfig : ScriptableObject
    {
        [Header("Server Configuration")]
        [Tooltip("Backend server host (without protocol)")]
        public string serverHost = "your-server-host.com";
        
        [Tooltip("Use SSL/TLS for connections")]
        public bool useSSL = true;

        [Header("User Configuration")]
        [Tooltip("User ID for the session")]
        public string userId = "default-user";

        [Header("Speech-to-Text Configuration")]
        [Tooltip("ElevenLabs API Key for STT (leave empty to use local STT)")]
        public string elevenlabsApiKey = "";

        [Header("Input Configuration")]
        [Tooltip("Time in seconds to hold left joystick to toggle debug terminal")]
        public float debugToggleHoldTime = 30f;

        [Header("Recording Configuration")]
        [Tooltip("Maximum recording duration in seconds")]
        public int maxRecordingSeconds = 30;
        
        [Tooltip("Audio sample rate")]
        public int sampleRate = 16000;
    }
}
