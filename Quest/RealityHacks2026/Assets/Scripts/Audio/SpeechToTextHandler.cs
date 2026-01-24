using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace RealityHacks.Audio
{
    [Serializable]
    public class WhisperResponse
    {
        public string text;
    }

    public class SpeechToTextHandler : MonoBehaviour
    {
        [Header("Whisper API Configuration")]
        [SerializeField] private string apiEndpoint = "https://api.openai.com/v1/audio/transcriptions";
        [SerializeField] private string apiKey = ""; // Set via SetApiKey() or inspector (not recommended for production)
        [SerializeField] private string model = "whisper-1";
        [SerializeField] private string language = "en";

        public event Action<string> OnTranscriptionComplete;
        public event Action<string> OnTranscriptionError;
        public event Action<string> OnStatusChanged;

        private bool isProcessing = false;

        public bool IsProcessing => isProcessing;

        public void SetApiKey(string key)
        {
            apiKey = key;
        }

        public void TranscribeAudio(byte[] wavData)
        {
            if (isProcessing)
            {
                OnTranscriptionError?.Invoke("Already processing audio");
                return;
            }

            if (string.IsNullOrEmpty(apiKey))
            {
                OnTranscriptionError?.Invoke("API key not configured");
                return;
            }

            StartCoroutine(SendTranscriptionRequest(wavData));
        }

        private IEnumerator SendTranscriptionRequest(byte[] wavData)
        {
            isProcessing = true;
            OnStatusChanged?.Invoke("Transcribing audio...");

            WWWForm form = new WWWForm();
            form.AddBinaryData("file", wavData, "audio.wav", "audio/wav");
            form.AddField("model", model);
            form.AddField("language", language);

            using (UnityWebRequest request = UnityWebRequest.Post(apiEndpoint, form))
            {
                request.SetRequestHeader("Authorization", $"Bearer {apiKey}");

                yield return request.SendWebRequest();

                isProcessing = false;

                if (request.result == UnityWebRequest.Result.Success)
                {
                    try
                    {
                        string responseText = request.downloadHandler.text;
                        WhisperResponse response = JsonUtility.FromJson<WhisperResponse>(responseText);
                        
                        OnStatusChanged?.Invoke("Transcription complete");
                        OnTranscriptionComplete?.Invoke(response.text);
                    }
                    catch (Exception ex)
                    {
                        OnTranscriptionError?.Invoke($"Failed to parse response: {ex.Message}");
                    }
                }
                else
                {
                    OnTranscriptionError?.Invoke($"Request failed: {request.error}");
                }
            }
        }
    }
}
