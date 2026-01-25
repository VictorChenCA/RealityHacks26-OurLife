using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace RealityHacks.UI
{
    public class DebugTerminal : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private TextMeshProUGUI terminalText;
        [SerializeField] private GameObject terminalPanel;
        [SerializeField] private ScrollRect scrollRect;
        [SerializeField] private int maxLines = 50;
        
        [Header("Scroll Settings")]
        [SerializeField] private float scrollSpeed = 2f;
        [SerializeField] private float joystickDeadzone = 0.15f;
        
        private bool autoScroll = true;

        [Header("Appearance")]
        [SerializeField] private Color timestampColor = new Color(0.5f, 0.5f, 0.5f);
        [SerializeField] private Color sendColor = new Color(0.3f, 0.8f, 0.3f);
        [SerializeField] private Color receiveColor = new Color(0.3f, 0.6f, 1f);
        [SerializeField] private Color errorColor = new Color(1f, 0.3f, 0.3f);
        [SerializeField] private Color defaultColor = Color.white;

        private Queue<string> logLines = new Queue<string>();
        private StringBuilder displayBuilder = new StringBuilder();
        private bool isVisible = false;

        public bool IsVisible => isVisible;

        private RealityHacks.Input.VRInputManager inputManager;

        private void Awake()
        {
            if (terminalPanel != null)
            {
                terminalPanel.SetActive(false);
            }
        }

        private void Start()
        {
            inputManager = FindObjectOfType<RealityHacks.Input.VRInputManager>();
        }

        private float scrollDebugTimer = 0f;
        
        private void Update()
        {
            if (!isVisible || inputManager == null) return;
            
            float joystickY = inputManager.RightJoystick.y;
            
            // Debug log joystick value periodically
            scrollDebugTimer += Time.deltaTime;
            if (scrollDebugTimer >= 1f && Mathf.Abs(joystickY) > 0.01f)
            {
                scrollDebugTimer = 0f;
                Debug.Log($"[DebugTerminal] Joystick Y: {joystickY:F2}, ScrollPos: {scrollRect?.verticalNormalizedPosition:F2}");
            }
            
            // If joystick moved, disable auto-scroll and scroll manually
            if (Mathf.Abs(joystickY) > joystickDeadzone)
            {
                autoScroll = false;
                if (scrollRect != null)
                {
                    scrollRect.verticalNormalizedPosition += joystickY * scrollSpeed * Time.deltaTime;
                    scrollRect.verticalNormalizedPosition = Mathf.Clamp01(scrollRect.verticalNormalizedPosition);
                }
            }
            
            // Re-enable auto-scroll if scrolled to bottom
            if (scrollRect != null && scrollRect.verticalNormalizedPosition <= 0.01f)
            {
                autoScroll = true;
            }
        }

        public void Log(string message)
        {
            string timestamp = System.DateTime.Now.ToString("HH:mm:ss.fff");
            string colorHex = ColorToHex(GetMessageColor(message));
            string timestampHex = ColorToHex(timestampColor);
            
            string formattedLine = $"<color={timestampHex}>[{timestamp}]</color> <color={colorHex}>{message}</color>";
            
            logLines.Enqueue(formattedLine);
            
            while (logLines.Count > maxLines)
            {
                logLines.Dequeue();
            }

            UpdateDisplay();
        }

        public void LogSend(string message)
        {
            Log($"[SEND] {message}");
        }

        public void LogReceive(string message)
        {
            Log($"[RECV] {message}");
        }

        public void LogError(string message)
        {
            Log($"[ERROR] {message}");
        }

        public void LogStatus(string message)
        {
            Log($"[STATUS] {message}");
        }

        private Color GetMessageColor(string message)
        {
            if (message.Contains("[SEND]")) return sendColor;
            if (message.Contains("[RECV]")) return receiveColor;
            if (message.Contains("[ERROR]")) return errorColor;
            if (message.Contains("[CONNECT]") || message.Contains("[CONNECTED]")) return sendColor;
            if (message.Contains("[DISCONNECT]")) return errorColor;
            return defaultColor;
        }

        private string ColorToHex(Color color)
        {
            return $"#{ColorUtility.ToHtmlStringRGB(color)}";
        }

        private void UpdateDisplay()
        {
            if (terminalText == null) return;

            displayBuilder.Clear();
            foreach (string line in logLines)
            {
                displayBuilder.AppendLine(line);
            }

            terminalText.text = displayBuilder.ToString();
            
            // Auto-scroll to bottom if enabled
            if (autoScroll && scrollRect != null)
            {
                Canvas.ForceUpdateCanvases();
                scrollRect.verticalNormalizedPosition = 0f;
            }
        }

        public void Show()
        {
            isVisible = true;
            if (terminalPanel != null)
            {
                terminalPanel.SetActive(true);
            }
            Log("[STATUS] Debug terminal opened");
        }

        public void Hide()
        {
            isVisible = false;
            if (terminalPanel != null)
            {
                terminalPanel.SetActive(false);
            }
        }

        public void Toggle()
        {
            if (isVisible)
            {
                Hide();
            }
            else
            {
                Show();
            }
        }

        public void Clear()
        {
            logLines.Clear();
            UpdateDisplay();
            Log("[STATUS] Terminal cleared");
        }
    }
}
