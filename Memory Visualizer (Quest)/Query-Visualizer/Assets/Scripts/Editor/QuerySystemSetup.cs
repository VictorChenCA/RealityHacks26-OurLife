#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using TMPro;
using UnityEngine.UI;

namespace RealityHacks.Editor
{
    public class QuerySystemSetup : EditorWindow
    {
        [MenuItem("RealityHacks/Setup Query System")]
        public static void ShowWindow()
        {
            GetWindow<QuerySystemSetup>("Query System Setup");
        }

        private void OnGUI()
        {
            GUILayout.Label("Query System Setup", EditorStyles.boldLabel);
            GUILayout.Space(10);

            if (GUILayout.Button("Create Query System GameObject"))
            {
                CreateQuerySystem();
            }

            GUILayout.Space(10);

            if (GUILayout.Button("Create Debug Terminal UI"))
            {
                CreateDebugTerminalUI();
            }

            GUILayout.Space(10);

            if (GUILayout.Button("Create Mic Status Indicator"))
            {
                CreateMicStatusIndicator();
            }

            GUILayout.Space(20);
            GUILayout.Label("Instructions:", EditorStyles.boldLabel);
            EditorGUILayout.HelpBox(
                "1. Click 'Create Query System GameObject' to create the main controller\n" +
                "2. Click 'Create Debug Terminal UI' for the debug console\n" +
                "3. Click 'Create Mic Status Indicator' for the mic icon\n" +
                "4. Configure server settings in the QueryWebSocketClient component\n" +
                "5. Set your Whisper API key in SpeechToTextHandler (optional)",
                MessageType.Info);
        }

        private static void CreateQuerySystem()
        {
            GameObject querySystem = new GameObject("QuerySystem");
            
            // Add core components
            querySystem.AddComponent<RealityHacks.Core.QueryController>();
            querySystem.AddComponent<RealityHacks.Network.QueryWebSocketClient>();
            querySystem.AddComponent<RealityHacks.Network.UnityMainThreadDispatcher>();
            querySystem.AddComponent<RealityHacks.Audio.MicrophoneManager>();
            querySystem.AddComponent<RealityHacks.Audio.SpeechToTextHandler>();
            querySystem.AddComponent<RealityHacks.Input.VRInputManager>();

            Selection.activeGameObject = querySystem;
            Debug.Log("[QuerySystemSetup] Created QuerySystem GameObject with all components");
        }

        private static void CreateDebugTerminalUI()
        {
            // Find or create Canvas
            Canvas canvas = FindObjectOfType<Canvas>();
            if (canvas == null)
            {
                GameObject canvasObj = new GameObject("Canvas");
                canvas = canvasObj.AddComponent<Canvas>();
                canvas.renderMode = RenderMode.WorldSpace;
                canvasObj.AddComponent<CanvasScaler>();
                canvasObj.AddComponent<GraphicRaycaster>();
            }

            // Create terminal panel
            GameObject terminalPanel = new GameObject("DebugTerminalPanel");
            terminalPanel.transform.SetParent(canvas.transform, false);

            RectTransform panelRect = terminalPanel.AddComponent<RectTransform>();
            panelRect.sizeDelta = new Vector2(800, 600);
            panelRect.localPosition = new Vector3(0, 0, 2);
            panelRect.localScale = Vector3.one * 0.001f;

            Image panelImage = terminalPanel.AddComponent<Image>();
            panelImage.color = new Color(0.1f, 0.1f, 0.1f, 0.9f);

            // Create text
            GameObject textObj = new GameObject("TerminalText");
            textObj.transform.SetParent(terminalPanel.transform, false);

            RectTransform textRect = textObj.AddComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.offsetMin = new Vector2(10, 10);
            textRect.offsetMax = new Vector2(-10, -10);

            TextMeshProUGUI tmpText = textObj.AddComponent<TextMeshProUGUI>();
            tmpText.fontSize = 14;
            tmpText.color = Color.white;
            tmpText.alignment = TextAlignmentOptions.TopLeft;
            tmpText.enableWordWrapping = true;
            tmpText.overflowMode = TextOverflowModes.Truncate;

            // Add DebugTerminal component
            RealityHacks.UI.DebugTerminal terminal = terminalPanel.AddComponent<RealityHacks.UI.DebugTerminal>();
            
            // Use SerializedObject to set private fields
            SerializedObject serializedTerminal = new SerializedObject(terminal);
            serializedTerminal.FindProperty("terminalText").objectReferenceValue = tmpText;
            serializedTerminal.FindProperty("terminalPanel").objectReferenceValue = terminalPanel;
            serializedTerminal.ApplyModifiedProperties();

            terminalPanel.SetActive(false);

            Selection.activeGameObject = terminalPanel;
            Debug.Log("[QuerySystemSetup] Created Debug Terminal UI");
        }

        private static void CreateMicStatusIndicator()
        {
            Canvas canvas = FindObjectOfType<Canvas>();
            if (canvas == null)
            {
                GameObject canvasObj = new GameObject("Canvas");
                canvas = canvasObj.AddComponent<Canvas>();
                canvas.renderMode = RenderMode.WorldSpace;
                canvasObj.AddComponent<CanvasScaler>();
                canvasObj.AddComponent<GraphicRaycaster>();
            }

            // Create mic indicator
            GameObject micIndicator = new GameObject("MicStatusIndicator");
            micIndicator.transform.SetParent(canvas.transform, false);

            RectTransform indicatorRect = micIndicator.AddComponent<RectTransform>();
            indicatorRect.sizeDelta = new Vector2(50, 50);
            indicatorRect.localPosition = new Vector3(-350, 250, 2);
            indicatorRect.localScale = Vector3.one * 0.001f;

            // Background circle
            Image bgImage = micIndicator.AddComponent<Image>();
            bgImage.color = new Color(0.2f, 0.2f, 0.2f, 0.8f);

            // Mic icon (child)
            GameObject iconObj = new GameObject("MicIcon");
            iconObj.transform.SetParent(micIndicator.transform, false);

            RectTransform iconRect = iconObj.AddComponent<RectTransform>();
            iconRect.anchorMin = new Vector2(0.2f, 0.2f);
            iconRect.anchorMax = new Vector2(0.8f, 0.8f);
            iconRect.offsetMin = Vector2.zero;
            iconRect.offsetMax = Vector2.zero;

            Image iconImage = iconObj.AddComponent<Image>();
            iconImage.color = new Color(0.5f, 0.5f, 0.5f);

            // Add status indicator component
            RealityHacks.UI.MicrophoneStatusIndicator indicator = micIndicator.AddComponent<RealityHacks.UI.MicrophoneStatusIndicator>();
            
            SerializedObject serializedIndicator = new SerializedObject(indicator);
            serializedIndicator.FindProperty("micIconImage").objectReferenceValue = iconImage;
            serializedIndicator.FindProperty("backgroundImage").objectReferenceValue = bgImage;
            serializedIndicator.ApplyModifiedProperties();

            Selection.activeGameObject = micIndicator;
            Debug.Log("[QuerySystemSetup] Created Mic Status Indicator");
        }
    }
}
#endif
