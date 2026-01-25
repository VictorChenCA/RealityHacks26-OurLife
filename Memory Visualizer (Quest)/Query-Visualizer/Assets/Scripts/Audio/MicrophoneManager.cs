using System;
using System.Collections;
using UnityEngine;

namespace RealityHacks.Audio
{
    public class MicrophoneManager : MonoBehaviour
    {
        [Header("Recording Settings")]
        [SerializeField] private int sampleRate = 16000;
        [SerializeField] private int maxRecordingSeconds = 30;
        
        public event Action OnRecordingStarted;
        public event Action OnRecordingStopped;
        public event Action<float[]> OnAudioDataReady;
        public event Action<string> OnStatusChanged;

        private AudioClip recordingClip;
        private string currentMicDevice;
        private bool isRecording = false;
        private int lastSamplePosition = 0;

        public bool IsRecording => isRecording;
        public bool IsMicrophoneAvailable => Microphone.devices.Length > 0;

        private void Start()
        {
            InitializeMicrophone();
        }

        public void InitializeMicrophone()
        {
            if (Microphone.devices.Length > 0)
            {
                currentMicDevice = Microphone.devices[0];
                OnStatusChanged?.Invoke($"Microphone found: {currentMicDevice}");
                Debug.Log($"[MicrophoneManager] Using device: {currentMicDevice}");
            }
            else
            {
                OnStatusChanged?.Invoke("No microphone found!");
                Debug.LogWarning("[MicrophoneManager] No microphone devices found!");
            }
        }

        public void StartRecording()
        {
            if (isRecording)
            {
                Debug.LogWarning("[MicrophoneManager] Already recording");
                return;
            }

            if (string.IsNullOrEmpty(currentMicDevice))
            {
                OnStatusChanged?.Invoke("Error: No microphone available");
                return;
            }

            recordingClip = Microphone.Start(currentMicDevice, false, maxRecordingSeconds, sampleRate);
            lastSamplePosition = 0;
            isRecording = true;

            OnStatusChanged?.Invoke("Recording started...");
            OnRecordingStarted?.Invoke();
            Debug.Log("[MicrophoneManager] Recording started");
        }

        public void StopRecording()
        {
            if (!isRecording)
            {
                Debug.LogWarning("[MicrophoneManager] Not currently recording");
                return;
            }

            int currentPosition = Microphone.GetPosition(currentMicDevice);
            Microphone.End(currentMicDevice);
            isRecording = false;

            if (recordingClip != null && currentPosition > 0)
            {
                float[] audioData = new float[currentPosition * recordingClip.channels];
                recordingClip.GetData(audioData, 0);
                
                OnAudioDataReady?.Invoke(audioData);
                OnStatusChanged?.Invoke($"Recording stopped. Captured {currentPosition} samples");
                Debug.Log($"[MicrophoneManager] Recording stopped. Samples: {currentPosition}");
            }
            else
            {
                OnStatusChanged?.Invoke("Recording stopped (no data captured)");
            }

            OnRecordingStopped?.Invoke();
        }

        public byte[] GetAudioAsWavBytes(float[] audioData)
        {
            return ConvertToWav(audioData, sampleRate, 1);
        }

        private byte[] ConvertToWav(float[] samples, int sampleRate, int channels)
        {
            int sampleCount = samples.Length;
            int byteRate = sampleRate * channels * 2;
            int blockAlign = channels * 2;
            int dataSize = sampleCount * 2;
            int fileSize = 44 + dataSize;

            byte[] wav = new byte[fileSize];
            int pos = 0;

            // RIFF header
            wav[pos++] = (byte)'R'; wav[pos++] = (byte)'I'; wav[pos++] = (byte)'F'; wav[pos++] = (byte)'F';
            WriteInt32(wav, ref pos, fileSize - 8);
            wav[pos++] = (byte)'W'; wav[pos++] = (byte)'A'; wav[pos++] = (byte)'V'; wav[pos++] = (byte)'E';

            // fmt chunk
            wav[pos++] = (byte)'f'; wav[pos++] = (byte)'m'; wav[pos++] = (byte)'t'; wav[pos++] = (byte)' ';
            WriteInt32(wav, ref pos, 16); // chunk size
            WriteInt16(wav, ref pos, 1);  // audio format (PCM)
            WriteInt16(wav, ref pos, (short)channels);
            WriteInt32(wav, ref pos, sampleRate);
            WriteInt32(wav, ref pos, byteRate);
            WriteInt16(wav, ref pos, (short)blockAlign);
            WriteInt16(wav, ref pos, 16); // bits per sample

            // data chunk
            wav[pos++] = (byte)'d'; wav[pos++] = (byte)'a'; wav[pos++] = (byte)'t'; wav[pos++] = (byte)'a';
            WriteInt32(wav, ref pos, dataSize);

            // audio data
            for (int i = 0; i < sampleCount; i++)
            {
                short sample = (short)(Mathf.Clamp(samples[i], -1f, 1f) * 32767f);
                wav[pos++] = (byte)(sample & 0xFF);
                wav[pos++] = (byte)((sample >> 8) & 0xFF);
            }

            return wav;
        }

        private void WriteInt32(byte[] data, ref int pos, int value)
        {
            data[pos++] = (byte)(value & 0xFF);
            data[pos++] = (byte)((value >> 8) & 0xFF);
            data[pos++] = (byte)((value >> 16) & 0xFF);
            data[pos++] = (byte)((value >> 24) & 0xFF);
        }

        private void WriteInt16(byte[] data, ref int pos, short value)
        {
            data[pos++] = (byte)(value & 0xFF);
            data[pos++] = (byte)((value >> 8) & 0xFF);
        }

        private void OnDestroy()
        {
            if (isRecording)
            {
                Microphone.End(currentMicDevice);
            }
        }
    }
}
