using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;

namespace RealityHacks.Network
{
    [Serializable]
    public class QueryRequest
    {
        public string text;
        public string imageURL;
        public DateRange dateRange;
        public bool includeFaces = true;
        public int maxImages = 8;
    }

    [Serializable]
    public class DateRange
    {
        public string start;
        public string end;
    }

    [Serializable]
    public class QueryResponse
    {
        public string type;
        public bool ok;
        public string answer;
        public float confidence;
        public string message;
        public string[] options;
        public string error;
        public string detail;
        public string suggestedFollowUp;
    }

    [Serializable]
    public class UploadResponse
    {
        public string status;
        public string url;
        public string queryId;
        public string error;
    }

    public class QueryWebSocketClient : MonoBehaviour
    {
        [Header("Server Configuration")]
        [SerializeField] private string serverHost = "memory-backend-328251955578.us-east1.run.app";
        [SerializeField] private string userId = "default-user";
        [SerializeField] private bool useSSL = true;

        public event Action<string> OnMessageReceived;
        public event Action<QueryResponse> OnQueryResponse;
        public event Action OnConnected;
        public event Action OnDisconnected;
        public event Action<string> OnError;

        private NativeWebSocket webSocket;
        private bool isConnected = false;

        public bool IsConnected => isConnected;

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
        }

        public async void Connect()
        {
            if (isConnected) return;

            string protocol = useSSL ? "wss" : "ws";
            string url = $"{protocol}://{serverHost}/ws/query/{userId}";

            Debug.Log($"[WebSocket] Connecting to: {url}");
            OnMessageReceived?.Invoke($"[CONNECT] Attempting connection to {url}");

            try
            {
                webSocket = new NativeWebSocket(url);

                webSocket.OnOpen += () =>
                {
                    isConnected = true;
                    UnityMainThreadDispatcher.Instance.Enqueue(() =>
                    {
                        OnConnected?.Invoke();
                        OnMessageReceived?.Invoke("[CONNECTED] WebSocket connection established");
                    });
                };

                webSocket.OnMessage += (message) =>
                {
                    UnityMainThreadDispatcher.Instance.Enqueue(() =>
                    {
                        ProcessMessage(message);
                    });
                };

                webSocket.OnError += (error) =>
                {
                    UnityMainThreadDispatcher.Instance.Enqueue(() =>
                    {
                        OnError?.Invoke(error);
                        OnMessageReceived?.Invoke($"[ERROR] {error}");
                    });
                };

                webSocket.OnClose += (code, reason) =>
                {
                    isConnected = false;
                    UnityMainThreadDispatcher.Instance.Enqueue(() =>
                    {
                        OnDisconnected?.Invoke();
                        OnMessageReceived?.Invoke($"[DISCONNECTED] Code: {code}, Reason: {reason}");
                    });
                };

                await webSocket.Connect();
            }
            catch (Exception ex)
            {
                Debug.LogError($"[WebSocket] Connection error: {ex.Message}");
                OnError?.Invoke(ex.Message);
            }
        }

        public async void Disconnect()
        {
            if (webSocket != null && isConnected)
            {
                await webSocket.Close();
            }
        }

        public async void SendQuery(string text, string imageURL = null)
        {
            if (!isConnected)
            {
                OnError?.Invoke("Not connected to server");
                return;
            }

            QueryRequest request = new QueryRequest
            {
                text = text,
                imageURL = imageURL,
                includeFaces = true,
                maxImages = 8
            };

            string json = JsonUtility.ToJson(request);
            OnMessageReceived?.Invoke($"[SEND] {json}");
            await webSocket.Send(json);
        }

        public async void SendFollowUp(string text)
        {
            if (!isConnected)
            {
                OnError?.Invoke("Not connected to server");
                return;
            }

            var followUp = new { text = text };
            string json = JsonUtility.ToJson(followUp);
            OnMessageReceived?.Invoke($"[SEND] {json}");
            await webSocket.Send(json);
        }

        private void ProcessMessage(string message)
        {
            OnMessageReceived?.Invoke($"[RECV] {message}");

            try
            {
                QueryResponse response = JsonUtility.FromJson<QueryResponse>(message);
                OnQueryResponse?.Invoke(response);
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[WebSocket] Failed to parse response: {ex.Message}");
            }
        }

        public IEnumerator UploadImage(byte[] imageData, string queryId, Action<UploadResponse> callback)
        {
            string protocol = useSSL ? "https" : "http";
            string url = $"{protocol}://{serverHost}/query-upload/{queryId}";

            OnMessageReceived?.Invoke($"[UPLOAD] Uploading image to {url}");

            WWWForm form = new WWWForm();
            form.AddBinaryData("file", imageData, "image.jpg", "image/jpeg");

            using (UnityWebRequest request = UnityWebRequest.Post(url, form))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    string responseText = request.downloadHandler.text;
                    OnMessageReceived?.Invoke($"[UPLOAD] Response: {responseText}");
                    UploadResponse response = JsonUtility.FromJson<UploadResponse>(responseText);
                    callback?.Invoke(response);
                }
                else
                {
                    OnMessageReceived?.Invoke($"[UPLOAD ERROR] {request.error}");
                    callback?.Invoke(new UploadResponse { status = "error", error = request.error });
                }
            }
        }

        public void SetServerHost(string host)
        {
            serverHost = host;
        }

        public void SetUserId(string id)
        {
            userId = id;
        }

        public string GetServerInfo()
        {
            string protocol = useSSL ? "wss" : "ws";
            return $"{protocol}://{serverHost}/ws/query/{userId}";
        }

        private void OnDestroy()
        {
            Disconnect();
        }
    }
}
