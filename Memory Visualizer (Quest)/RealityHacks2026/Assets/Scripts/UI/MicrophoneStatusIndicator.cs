using UnityEngine;
using UnityEngine.UI;

namespace RealityHacks.UI
{
    public class MicrophoneStatusIndicator : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private Image micIconImage;
        [SerializeField] private Image backgroundImage;

        [Header("Colors")]
        [SerializeField] private Color activeColor = new Color(0.2f, 0.8f, 0.2f); // Green
        [SerializeField] private Color inactiveColor = new Color(0.5f, 0.5f, 0.5f); // Grey
        [SerializeField] private Color recordingPulseColor = new Color(0.3f, 1f, 0.3f); // Bright green

        [Header("Animation")]
        [SerializeField] private float pulseSpeed = 2f;
        [SerializeField] private bool enablePulse = true;

        private bool isRecording = false;
        private bool isConnected = false;
        private float pulseTimer = 0f;

        public bool IsActive => isRecording && isConnected;

        private void Update()
        {
            if (isRecording && isConnected && enablePulse)
            {
                AnimatePulse();
            }
        }

        public void SetRecordingState(bool recording)
        {
            isRecording = recording;
            UpdateVisualState();
        }

        public void SetConnectionState(bool connected)
        {
            isConnected = connected;
            UpdateVisualState();
        }

        private void UpdateVisualState()
        {
            if (micIconImage == null) return;

            if (isRecording && isConnected)
            {
                micIconImage.color = activeColor;
                pulseTimer = 0f;
            }
            else
            {
                micIconImage.color = inactiveColor;
            }
        }

        private void AnimatePulse()
        {
            if (micIconImage == null) return;

            pulseTimer += Time.deltaTime * pulseSpeed;
            float t = (Mathf.Sin(pulseTimer * Mathf.PI * 2) + 1f) / 2f;
            micIconImage.color = Color.Lerp(activeColor, recordingPulseColor, t);
        }

        public void SetColors(Color active, Color inactive)
        {
            activeColor = active;
            inactiveColor = inactive;
            UpdateVisualState();
        }
    }
}
