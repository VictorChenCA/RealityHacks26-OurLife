using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace RealityHacks.Audio
{
    [Serializable]
    public class ElevenLabsSTTResponse
    {
        public string text;
    }

    public class SpeechToTextHandler : MonoBehaviour
    {
        [Header("ElevenLabs STT Configuration")]
        [SerializeField] private string apiEndpoint = "https://api.elevenlabs.io/v1/speech-to-text";
        [SerializeField] private string apiKey = ""; // Set via SetApiKey() or inspector (not recommended for production)
        [SerializeField] private string model = "scribe_v1";

        public event Action<string> OnTranscriptionComplete;
        public event Action<string> OnTranscriptionError;
        public event Action<string> OnStatusChanged;

        private bool isProcessing = false;

        public bool IsProcessing => isProcessing;

        public bool IsApiKeyConfigured()
        {
            return !string.IsNullOrEmpty(apiKey);
        }

        public void SetApiKey(string key)
        {
            apiKey = key;
        }

        public void TranscribeAudio(byte[] wavData)
        {
            Debug.Log($"[STT] TranscribeAudio called with {wavData?.Length ?? 0} bytes");
            
            if (isProcessing)
            {
                Debug.LogWarning("[STT] Already processing audio - rejecting request");
                OnTranscriptionError?.Invoke("Already processing audio");
                return;
            }

            if (string.IsNullOrEmpty(apiKey))
            {
                Debug.LogError("[STT] API key not configured!");
                OnTranscriptionError?.Invoke("API key not configured");
                return;
            }

            Debug.Log($"[STT] Starting transcription request to ElevenLabs...");
            StartCoroutine(SendTranscriptionRequest(wavData));
        }

        private IEnumerator SendTranscriptionRequest(byte[] wavData)
        {
            isProcessing = true;
            OnStatusChanged?.Invoke("Transcribing audio...");
            Debug.Log($"[STT] Sending {wavData.Length} bytes to {apiEndpoint}");

            WWWForm form = new WWWForm();
            form.AddBinaryData("file", wavData, "audio.wav", "audio/wav");
            form.AddField("model_id", model);

            using (UnityWebRequest request = UnityWebRequest.Post(apiEndpoint, form))
            {
                request.SetRequestHeader("xi-api-key", apiKey);
                Debug.Log("[STT] Request sent, waiting for response...");

                yield return request.SendWebRequest();

                isProcessing = false;
                Debug.Log($"[STT] Response received: {request.result}, Code: {request.responseCode}");

                if (request.result == UnityWebRequest.Result.Success)
                {
                    try
                    {
                        string responseText = request.downloadHandler.text;
                        Debug.Log($"[STT] Raw response: {responseText}");
                        ElevenLabsSTTResponse response = JsonUtility.FromJson<ElevenLabsSTTResponse>(responseText);
                        
                        Debug.Log($"[STT] Transcription result: {response.text}");
                        OnStatusChanged?.Invoke("Transcription complete");
                        OnTranscriptionComplete?.Invoke(response.text);
                    }
                    catch (Exception ex)
                    {
                        Debug.LogError($"[STT] Parse error: {ex.Message}");
                        OnTranscriptionError?.Invoke($"Failed to parse response: {ex.Message}");
                    }
                }
                else
                {
                    Debug.LogError($"[STT] Request failed: {request.error}, Response: {request.downloadHandler?.text}");
                    OnTranscriptionError?.Invoke($"Request failed: {request.error}");
                }
            }
        }
    }
}
