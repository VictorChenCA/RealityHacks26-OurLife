using System;
using System.Collections;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;

namespace RealityHacks.Audio
{
    public enum AudioPlaybackState
    {
        Idle,
        Loading,
        Playing,
        Error
    }

    public class QueryAudioManager : MonoBehaviour
    {
        [Header("Audio Configuration")]
        [SerializeField] private AudioSource audioSource;
        [SerializeField] private float downloadTimeoutSeconds = 10f;

        public event Action<AudioPlaybackState> OnStateChanged;
        public event Action<string> OnError;
        public event Action OnPlaybackComplete;

        private AudioClip currentClip;
        private CancellationTokenSource cancellationTokenSource;
        private Coroutine playbackMonitorCoroutine;

        public AudioPlaybackState CurrentState { get; private set; } = AudioPlaybackState.Idle;
        public bool IsPlaying => audioSource != null && audioSource.isPlaying;

        private void Awake()
        {
            if (audioSource == null)
            {
                audioSource = GetComponent<AudioSource>();
                if (audioSource == null)
                {
                    audioSource = gameObject.AddComponent<AudioSource>();
                }
            }

            audioSource.playOnAwake = false;
            audioSource.loop = false;
        }

        public async Task PlayResponseAudio(string audioURL)
        {
            if (string.IsNullOrEmpty(audioURL))
            {
                Debug.Log("[QueryAudioManager] No audio URL provided, skipping playback");
                return;
            }

            StopAudio();

            cancellationTokenSource = new CancellationTokenSource();
            var token = cancellationTokenSource.Token;

            SetState(AudioPlaybackState.Loading);
            Debug.Log($"[QueryAudioManager] Downloading audio from: {audioURL}");

            try
            {
                AudioClip clip = await DownloadAudioClip(audioURL, token);

                if (token.IsCancellationRequested)
                {
                    Debug.Log("[QueryAudioManager] Download cancelled");
                    CleanupClip(clip);
                    SetState(AudioPlaybackState.Idle);
                    return;
                }

                if (clip == null)
                {
                    throw new Exception("Failed to load audio clip");
                }

                CleanupCurrentClip();
                currentClip = clip;

                audioSource.clip = currentClip;
                audioSource.Play();

                SetState(AudioPlaybackState.Playing);
                Debug.Log($"[QueryAudioManager] Playing audio (duration: {clip.length:F2}s)");

                playbackMonitorCoroutine = StartCoroutine(MonitorPlayback());
            }
            catch (OperationCanceledException)
            {
                Debug.Log("[QueryAudioManager] Audio download was cancelled");
                SetState(AudioPlaybackState.Idle);
            }
            catch (Exception ex)
            {
                Debug.LogError($"[QueryAudioManager] Error playing audio: {ex.Message}");
                OnError?.Invoke(ex.Message);
                SetState(AudioPlaybackState.Error);
            }
        }

        private async Task<AudioClip> DownloadAudioClip(string url, CancellationToken token)
        {
            var tcs = new TaskCompletionSource<AudioClip>();

            StartCoroutine(DownloadAudioCoroutine(url, tcs, token));

            var timeoutTask = Task.Delay(TimeSpan.FromSeconds(downloadTimeoutSeconds), token);
            var completedTask = await Task.WhenAny(tcs.Task, timeoutTask);

            if (completedTask == timeoutTask)
            {
                throw new TimeoutException($"Audio download timed out after {downloadTimeoutSeconds} seconds");
            }

            return await tcs.Task;
        }

        private IEnumerator DownloadAudioCoroutine(string url, TaskCompletionSource<AudioClip> tcs, CancellationToken token)
        {
            using (UnityWebRequest request = UnityWebRequestMultimedia.GetAudioClip(url, AudioType.MPEG))
            {
                var asyncOp = request.SendWebRequest();

                while (!asyncOp.isDone)
                {
                    if (token.IsCancellationRequested)
                    {
                        request.Abort();
                        tcs.TrySetCanceled();
                        yield break;
                    }
                    yield return null;
                }

                if (token.IsCancellationRequested)
                {
                    tcs.TrySetCanceled();
                    yield break;
                }

                if (request.result == UnityWebRequest.Result.Success)
                {
                    AudioClip clip = DownloadHandlerAudioClip.GetContent(request);
                    if (clip != null && clip.loadState == AudioDataLoadState.Loaded)
                    {
                        tcs.TrySetResult(clip);
                    }
                    else
                    {
                        tcs.TrySetException(new Exception("Audio clip failed to load properly"));
                    }
                }
                else
                {
                    tcs.TrySetException(new Exception($"Download failed: {request.error}"));
                }
            }
        }

        private IEnumerator MonitorPlayback()
        {
            while (audioSource != null && audioSource.isPlaying)
            {
                yield return null;
            }

            if (CurrentState == AudioPlaybackState.Playing)
            {
                SetState(AudioPlaybackState.Idle);
                OnPlaybackComplete?.Invoke();
                Debug.Log("[QueryAudioManager] Playback complete");
            }
        }

        public void StopAudio()
        {
            cancellationTokenSource?.Cancel();
            cancellationTokenSource?.Dispose();
            cancellationTokenSource = null;

            if (playbackMonitorCoroutine != null)
            {
                StopCoroutine(playbackMonitorCoroutine);
                playbackMonitorCoroutine = null;
            }

            if (audioSource != null && audioSource.isPlaying)
            {
                audioSource.Stop();
                Debug.Log("[QueryAudioManager] Audio stopped");
            }

            CleanupCurrentClip();
            SetState(AudioPlaybackState.Idle);
        }

        public void PauseAudio()
        {
            if (audioSource != null && audioSource.isPlaying)
            {
                audioSource.Pause();
            }
        }

        public void ResumeAudio()
        {
            if (audioSource != null && !audioSource.isPlaying && currentClip != null)
            {
                audioSource.UnPause();
            }
        }

        public void TogglePlayPause()
        {
            if (audioSource == null || currentClip == null) return;

            if (audioSource.isPlaying)
            {
                PauseAudio();
            }
            else
            {
                ResumeAudio();
            }
        }

        private void SetState(AudioPlaybackState newState)
        {
            if (CurrentState != newState)
            {
                CurrentState = newState;
                OnStateChanged?.Invoke(newState);
            }
        }

        private void CleanupCurrentClip()
        {
            if (currentClip != null)
            {
                if (audioSource != null)
                {
                    audioSource.clip = null;
                }
                Destroy(currentClip);
                currentClip = null;
                Debug.Log("[QueryAudioManager] Cleaned up audio clip");
            }
        }

        private void CleanupClip(AudioClip clip)
        {
            if (clip != null)
            {
                Destroy(clip);
            }
        }

        private void OnDestroy()
        {
            StopAudio();
        }
    }
}
