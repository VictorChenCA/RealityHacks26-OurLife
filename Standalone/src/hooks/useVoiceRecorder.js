/**
 * useVoiceRecorder - 음성 녹음 훅 (Web Audio API Version)
 * Uses AudioContext + ScriptProcessor to capture PCM data and encode as WAV.
 * This avoids MediaRecorder specific issues on Quest (silent streams on restart, header issues).
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { encodeWAV } from '../utils/audio';

// Demo mode uses 10 seconds, production uses 20 minutes
const CHUNK_DURATION_MS = import.meta.env.VITE_DEMO_MODE === 'true'
    ? 10 * 1000        // 10 seconds for demo
    : 20 * 60 * 1000;  // 20 minutes for production

export function useVoiceRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    // audioChunks logic is less relevant here if we clear buffer, 
    // but we can keep it for manual "stop" functionality if needed.
    const [audioChunks, setAudioChunks] = useState([]);
    const [error, setError] = useState(null);
    const [permissionGranted, setPermissionGranted] = useState(false);

    const audioContextRef = useRef(null);
    const processorRef = useRef(null);
    const sourceRef = useRef(null);
    const streamRef = useRef(null);

    // Buffer for collecting PCM data
    const audioBufferRef = useRef([]); // Array of Float32Array
    const bufferLengthRef = useRef(0);

    // Internal state to control data collection
    const isCollectingRef = useRef(false);
    const mimeTypeRef = useRef('audio/wav');

    // Check browser compatibility
    const isSupported = useCallback(() => {
        return !!(window.AudioContext || window.webkitAudioContext) && !!navigator.mediaDevices;
    }, []);

    const cleanupAudioGraph = useCallback(() => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        // Don't close context, reuse it
    }, []);

    // Request microphone permission
    const requestPermission = useCallback(async () => {
        if (!isSupported()) {
            setError('Web Audio API not supported');
            return false;
        }

        try {
            // If stream exists and active, reuse
            if (streamRef.current && streamRef.current.active) {
                setPermissionGranted(true);
                return true;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            streamRef.current = stream;
            setPermissionGranted(true);
            setError(null);

            // Initialize AudioContext if needed
            if (!audioContextRef.current) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                audioContextRef.current = new AudioContextClass({ sampleRate: 44100 });
            }

            return true;
        } catch (err) {
            console.error('Microphone permission denied:', err);
            setError(`마이크 권한 필요: ${err.message}`);
            setPermissionGranted(false);
            return false;
        }
    }, [isSupported]);

    // Start recording
    const startRecording = useCallback(async () => {
        if (isRecording) return;

        // Ensure permission and stream
        if (!permissionGranted || !streamRef.current || !streamRef.current.active) {
            const granted = await requestPermission();
            if (!granted) return;
        }

        try {
            // Resume context (requires user gesture initially)
            if (audioContextRef.current?.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            // Clean up previous graph if any (to avoid duplicate connections)
            cleanupAudioGraph();

            const ctx = audioContextRef.current;

            // Create buffer size 4096 (approx 92ms at 44.1kHz)
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            const source = ctx.createMediaStreamSource(streamRef.current);

            processor.onaudioprocess = (e) => {
                if (!isCollectingRef.current) return;

                const inputData = e.inputBuffer.getChannelData(0);
                // Clone data because inputBuffer is reused
                const storedData = new Float32Array(inputData);
                audioBufferRef.current.push(storedData);
                bufferLengthRef.current += storedData.length;
            };

            source.connect(processor);
            processor.connect(ctx.destination); // Required for script processor to run

            processorRef.current = processor;
            sourceRef.current = source;

            // Reset buffer
            audioBufferRef.current = [];
            bufferLengthRef.current = 0;

            isCollectingRef.current = true;
            setIsRecording(true);
            setError(null);
            console.log('Recording started (Web Audio API)');

        } catch (err) {
            console.error('Failed to start recording:', err);
            setError(`녹음 시작 실패: ${err.message}`);
        }
    }, [isRecording, permissionGranted, requestPermission, cleanupAudioGraph]);

    // Stop recording
    const stopRecording = useCallback(() => {
        if (!isRecording) return;

        isCollectingRef.current = false;
        setIsRecording(false);
        // We don't stop the stream or context, just stop collecting data logic.
        // Actually we can disconnect capability.
        cleanupAudioGraph();
        console.log('Recording stopped');
    }, [isRecording, cleanupAudioGraph]);

    // Pause/Resume (Just aliases for Stop/Start logic in this architecture, or controlling collection flag)
    const pauseRecording = useCallback(() => {
        isCollectingRef.current = false;
        console.log('Recording paused (Data collection stopped)');
    }, []);

    const resumeRecording = useCallback(() => {
        isCollectingRef.current = true;
        // Reset buffer when resuming? No, maybe we want to append?
        // But for our cycle, we usually clearBuffer anyway.
        console.log('Recording resumed');
    }, []);

    // Get current audio as WAV blob and CLEAR BUFFER
    const getCurrentAudioBlob = useCallback(() => {
        if (bufferLengthRef.current === 0) {
            return null;
        }

        const sampleRate = audioContextRef.current?.sampleRate || 44100;

        // Flatten buffer
        const combined = new Float32Array(bufferLengthRef.current);
        let offset = 0;
        for (const chunk of audioBufferRef.current) {
            combined.set(chunk, offset);
            offset += chunk.length;
        }

        // Encode WAV
        const blob = encodeWAV(combined, sampleRate);
        console.log(`Generated WAV: ${(blob.size / 1024).toFixed(1)}KB`);

        // Reset buffer (Crucial for continuous chunks)
        audioBufferRef.current = [];
        bufferLengthRef.current = 0;

        return { blob, timestamp: new Date() };
    }, []);

    const clearBuffer = useCallback(() => {
        audioBufferRef.current = [];
        bufferLengthRef.current = 0;
    }, []);

    const getLastChunk = useCallback(() => null, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupAudioGraph();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [cleanupAudioGraph]);

    return {
        isRecording,
        audioChunks, // Legacy support
        error,
        permissionGranted,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        clearBuffer,
        getCurrentAudioBlob,
        getLastChunk,
        requestPermission,
        getMimeType: () => 'audio/wav', // Always WAV
        isSupported: isSupported()
    };
}
