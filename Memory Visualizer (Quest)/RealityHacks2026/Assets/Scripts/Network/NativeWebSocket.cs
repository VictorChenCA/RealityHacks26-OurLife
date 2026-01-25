using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;

#if UNITY_WEBGL && !UNITY_EDITOR
using System.Runtime.InteropServices;
#else
using System.Net.WebSockets;
#endif

namespace RealityHacks.Network
{
    public enum WebSocketState
    {
        Connecting,
        Open,
        Closing,
        Closed
    }

    public class NativeWebSocket
    {
        public event Action OnOpen;
        public event Action<string> OnMessage;
        public event Action<byte[]> OnBinaryMessage;
        public event Action<string> OnError;
        public event Action<int, string> OnClose;

        private string url;
        private WebSocketState state = WebSocketState.Closed;

#if UNITY_WEBGL && !UNITY_EDITOR
        // WebGL implementation would go here using JSLib
        private int instanceId;
#else
        private ClientWebSocket webSocket;
        private CancellationTokenSource cancellationToken;
        private readonly Queue<string> messageQueue = new Queue<string>();
        private readonly object lockObject = new object();
#endif

        public WebSocketState State => state;

        public NativeWebSocket(string url)
        {
            this.url = url;
        }

#if !UNITY_WEBGL || UNITY_EDITOR
        public async Task Connect()
        {
            if (state == WebSocketState.Open || state == WebSocketState.Connecting)
            {
                return;
            }

            state = WebSocketState.Connecting;
            webSocket = new ClientWebSocket();
            cancellationToken = new CancellationTokenSource();

            try
            {
                await webSocket.ConnectAsync(new Uri(url), cancellationToken.Token);
                state = WebSocketState.Open;
                OnOpen?.Invoke();
                _ = ReceiveLoop();
            }
            catch (Exception ex)
            {
                state = WebSocketState.Closed;
                OnError?.Invoke(ex.Message);
            }
        }

        public async Task Send(string message)
        {
            if (state != WebSocketState.Open)
            {
                OnError?.Invoke("WebSocket is not connected");
                return;
            }

            try
            {
                byte[] bytes = Encoding.UTF8.GetBytes(message);
                await webSocket.SendAsync(
                    new ArraySegment<byte>(bytes),
                    WebSocketMessageType.Text,
                    true,
                    cancellationToken.Token
                );
            }
            catch (Exception ex)
            {
                OnError?.Invoke(ex.Message);
            }
        }

        public async Task Send(byte[] data)
        {
            if (state != WebSocketState.Open)
            {
                OnError?.Invoke("WebSocket is not connected");
                return;
            }

            try
            {
                await webSocket.SendAsync(
                    new ArraySegment<byte>(data),
                    WebSocketMessageType.Binary,
                    true,
                    cancellationToken.Token
                );
            }
            catch (Exception ex)
            {
                OnError?.Invoke(ex.Message);
            }
        }

        public async Task Close()
        {
            if (state == WebSocketState.Closed || state == WebSocketState.Closing)
            {
                return;
            }

            state = WebSocketState.Closing;

            try
            {
                await webSocket.CloseAsync(
                    WebSocketCloseStatus.NormalClosure,
                    "Client closed",
                    cancellationToken.Token
                );
            }
            catch (Exception ex)
            {
                OnError?.Invoke(ex.Message);
            }
            finally
            {
                state = WebSocketState.Closed;
                cancellationToken?.Cancel();
                webSocket?.Dispose();
            }
        }

        private async Task ReceiveLoop()
        {
            byte[] buffer = new byte[8192];

            try
            {
                while (state == WebSocketState.Open)
                {
                    var result = await webSocket.ReceiveAsync(
                        new ArraySegment<byte>(buffer),
                        cancellationToken.Token
                    );

                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        state = WebSocketState.Closed;
                        OnClose?.Invoke((int)result.CloseStatus, result.CloseStatusDescription);
                        break;
                    }
                    else if (result.MessageType == WebSocketMessageType.Text)
                    {
                        string message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        OnMessage?.Invoke(message);
                    }
                    else if (result.MessageType == WebSocketMessageType.Binary)
                    {
                        byte[] data = new byte[result.Count];
                        Array.Copy(buffer, data, result.Count);
                        OnBinaryMessage?.Invoke(data);
                    }
                }
            }
            catch (OperationCanceledException)
            {
                // Expected when closing
            }
            catch (Exception ex)
            {
                OnError?.Invoke(ex.Message);
                state = WebSocketState.Closed;
                OnClose?.Invoke(1006, ex.Message);
            }
        }
#else
        // WebGL stubs - would need JSLib implementation
        public Task Connect() { return Task.CompletedTask; }
        public Task Send(string message) { return Task.CompletedTask; }
        public Task Send(byte[] data) { return Task.CompletedTask; }
        public Task Close() { return Task.CompletedTask; }
#endif
    }
}
