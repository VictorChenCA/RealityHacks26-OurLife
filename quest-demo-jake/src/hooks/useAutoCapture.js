/**
 * useAutoCapture - 자동 캡처 훅
 * Auto-captures screenshots and processes audio at intervals
 * 
 * Features:
 * - Configurable interval (20 min / 20 sec demo)
 * - Integrates voice recorder and OpenAI processing
 * - Manages timeline state
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { captureScreen, createPlaceholderImage } from '../utils/capture';
import { processAudioToSummary } from '../services/openai';
import { DEMO_TIMELINE, createDemoEntry, generateEntryId } from '../demo/DemoData';

// Demo mode uses 10 seconds, production uses 20 minutes
const CAPTURE_INTERVAL_MS = import.meta.env.VITE_DEMO_MODE === 'true'
    ? 10 * 1000        // 10 seconds for demo
    : 20 * 60 * 1000;  // 20 minutes for production

export function useAutoCapture({ voiceRecorder, onNewEntry } = {}) {
    const [timeline, setTimeline] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastCaptureTime, setLastCaptureTime] = useState(null);
    const [useDemoData, setUseDemoData] = useState(false);
    const [lastEntry, setLastEntry] = useState(null);

    const intervalRef = useRef(null);
    const demoIndexRef = useRef(0);
    const onNewEntryRef = useRef(onNewEntry);

    // Keep callback ref updated
    useEffect(() => {
        onNewEntryRef.current = onNewEntry;
    }, [onNewEntry]);

    const isProcessingRef = useRef(false);

    // Perform a single capture cycle
    const performCapture = useCallback(async () => {
        // Prevent overlap if previous capture is still processing
        if (isProcessingRef.current) {
            console.log('Skipping capture: Previous capture still processing');
            return;
        }

        isProcessingRef.current = true;
        setIsProcessing(true);

        try {
            const timestamp = new Date();
            let entry;

            if (useDemoData) {
                // Demo mode: use pre-generated data
                entry = createDemoEntry(demoIndexRef.current++);
                entry.photo = createPlaceholderImage(`Demo ${demoIndexRef.current}`);
            } else {
                // Real mode: capture screen and process audio
                const { blobUrl, blob } = await captureScreen();

                // Get current audio (including in-progress recording)
                const audioChunk = voiceRecorder?.getCurrentAudioBlob?.() || voiceRecorder?.getLastChunk?.();
                const mimeType = voiceRecorder?.getMimeType?.() || 'audio/webm';

                let result = {
                    transcript: '',
                    summary: '(음성 데이터 없음)',
                    timestamp
                };

                if (audioChunk?.blob) {
                    // Process audio with OpenAI
                    result = await processAudioToSummary(audioChunk.blob, mimeType);
                }

                entry = {
                    id: generateEntryId(),
                    timestamp: result.timestamp,
                    summary: result.summary,
                    transcript: result.transcript,
                    photo: blobUrl || createPlaceholderImage()
                };
            }

            // Add to timeline (newest first)
            setTimeline(prev => [entry, ...prev].slice(0, 10)); // Keep max 10 entries
            setLastCaptureTime(timestamp);
            setLastEntry(entry);

            // Callback for TTS
            if (onNewEntryRef.current) {
                onNewEntryRef.current(entry);
            }

            console.log('Capture complete:', entry.summary);

        } catch (error) {
            console.error('Capture failed:', error);
        } finally {
            isProcessingRef.current = false;
            setIsProcessing(false);
        }
    }, [useDemoData, voiceRecorder]);

    // Start auto-capture
    const startCapture = useCallback(() => {
        if (isActive) return;

        // Safety: clear any existing interval to prevent leaks/duplicates
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        setIsActive(true);
        console.log(`Auto-capture started (interval: ${CAPTURE_INTERVAL_MS / 1000}s)`);

        // Start new interval
        intervalRef.current = setInterval(performCapture, CAPTURE_INTERVAL_MS);
    }, [isActive, performCapture]);

    // Stop auto-capture completely
    const stopCapture = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsActive(false);
        console.log('Auto-capture stopped');
    }, []);

    // Pause timer (for TTS)
    const pauseCapture = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            console.log('Auto-capture timer paused (for TTS)');
        }
    }, []);

    // Resume timer (after TTS)
    const resumeCapture = useCallback(() => {
        if (isActive && !intervalRef.current) {
            console.log('Auto-capture timer resumed');
            intervalRef.current = setInterval(performCapture, CAPTURE_INTERVAL_MS);
        }
    }, [isActive, performCapture]);

    // Manual capture trigger
    const captureNow = useCallback(() => {
        performCapture();
    }, [performCapture]);

    // Toggle demo mode
    const toggleDemoMode = useCallback((enabled) => {
        setUseDemoData(enabled);
        if (enabled) {
            // Load demo timeline
            setTimeline(DEMO_TIMELINE);
        }
    }, []);

    // Clear timeline
    const clearTimeline = useCallback(() => {
        setTimeline([]);
        demoIndexRef.current = 0;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        // State
        timeline,
        isActive,
        isProcessing,
        lastCaptureTime,
        useDemoData,
        lastEntry,

        // Actions
        startCapture,
        stopCapture,
        pauseCapture,
        resumeCapture,
        captureNow,
        toggleDemoMode,
        clearTimeline,

        // Utils
        captureIntervalMs: CAPTURE_INTERVAL_MS
    };
}
