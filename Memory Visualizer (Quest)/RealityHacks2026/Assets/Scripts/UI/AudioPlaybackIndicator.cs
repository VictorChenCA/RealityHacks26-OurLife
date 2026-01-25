using UnityEngine;
using UnityEngine.UI;
using TMPro;
using RealityHacks.Audio;

namespace RealityHacks.UI
{
    public class AudioPlaybackIndicator : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject loadingIndicator;
        [SerializeField] private GameObject playingIndicator;
        [SerializeField] private GameObject errorIndicator;
        [SerializeField] private TextMeshProUGUI statusText;
        [SerializeField] private Button playPauseButton;
        [SerializeField] private Image playPauseIcon;

        [Header("Icons")]
        [SerializeField] private Sprite playIcon;
        [SerializeField] private Sprite pauseIcon;

        [Header("Animation")]
        [SerializeField] private float rotationSpeed = 180f;

        private QueryAudioManager audioManager;
        private bool isPlaying = false;

        private void Start()
        {
            HideAllIndicators();

            if (playPauseButton != null)
            {
                playPauseButton.onClick.AddListener(OnPlayPauseClicked);
                playPauseButton.gameObject.SetActive(false);
            }
        }

        public void Initialize(QueryAudioManager manager)
        {
            if (audioManager != null)
            {
                audioManager.OnStateChanged -= HandleStateChanged;
            }

            audioManager = manager;

            if (audioManager != null)
            {
                audioManager.OnStateChanged += HandleStateChanged;
            }
        }

        private void Update()
        {
            if (loadingIndicator != null && loadingIndicator.activeSelf)
            {
                loadingIndicator.transform.Rotate(0, 0, -rotationSpeed * Time.deltaTime);
            }
        }

        private void HandleStateChanged(AudioPlaybackState state)
        {
            HideAllIndicators();

            switch (state)
            {
                case AudioPlaybackState.Idle:
                    SetStatusText("");
                    SetPlayPauseButtonVisible(false);
                    break;

                case AudioPlaybackState.Loading:
                    ShowIndicator(loadingIndicator);
                    SetStatusText("Loading audio...");
                    SetPlayPauseButtonVisible(false);
                    break;

                case AudioPlaybackState.Playing:
                    ShowIndicator(playingIndicator);
                    SetStatusText("Playing");
                    isPlaying = true;
                    UpdatePlayPauseIcon();
                    SetPlayPauseButtonVisible(true);
                    break;

                case AudioPlaybackState.Error:
                    ShowIndicator(errorIndicator);
                    SetStatusText("Audio error");
                    SetPlayPauseButtonVisible(false);
                    break;
            }
        }

        private void HideAllIndicators()
        {
            if (loadingIndicator != null) loadingIndicator.SetActive(false);
            if (playingIndicator != null) playingIndicator.SetActive(false);
            if (errorIndicator != null) errorIndicator.SetActive(false);
        }

        private void ShowIndicator(GameObject indicator)
        {
            if (indicator != null)
            {
                indicator.SetActive(true);
            }
        }

        private void SetStatusText(string text)
        {
            if (statusText != null)
            {
                statusText.text = text;
                statusText.gameObject.SetActive(!string.IsNullOrEmpty(text));
            }
        }

        private void SetPlayPauseButtonVisible(bool visible)
        {
            if (playPauseButton != null)
            {
                playPauseButton.gameObject.SetActive(visible);
            }
        }

        private void OnPlayPauseClicked()
        {
            if (audioManager == null) return;

            audioManager.TogglePlayPause();
            isPlaying = !isPlaying;
            UpdatePlayPauseIcon();

            SetStatusText(isPlaying ? "Playing" : "Paused");
        }

        private void UpdatePlayPauseIcon()
        {
            if (playPauseIcon != null)
            {
                playPauseIcon.sprite = isPlaying ? pauseIcon : playIcon;
            }
        }

        private void OnDestroy()
        {
            if (audioManager != null)
            {
                audioManager.OnStateChanged -= HandleStateChanged;
            }

            if (playPauseButton != null)
            {
                playPauseButton.onClick.RemoveListener(OnPlayPauseClicked);
            }
        }
    }
}
