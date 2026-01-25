/**
 * useVoiceCommand - Voice command recognition hook
 * English and Korean voice command recognition using Web Speech API
 * 
 * Supported commands:
 * - "Start Recording" / "녹음 시작" (Start recording)
 * - "Stop Recording" / "녹음 종료" (Stop recording)
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// Voice command mappings (English + Korean)
const COMMANDS = {
    START: [
        // English
        'start recording', 'start record', 'begin recording', 'record',
        // Korean
        '녹음 시작', '녹음시작', '시작', '레코딩 시작'
    ],
    STOP: [
        // English
        'stop recording', 'stop record', 'end recording', 'stop',
        // Korean
        '녹음 종료', '녹음종료', '녹음 중지', '중지', '종료', '레코딩 종료'
    ]
};

const CONFIDENCE_THRESHOLD = 0.4; // Lowered for better recognition

export function useVoiceCommand({ onStart, onStop } = {}) {
    const [isListening, setIsListening] = useState(false);
    const [lastCommand, setLastCommand] = useState(null);
    const [lastTranscript, setLastTranscript] = useState('');
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState('en-US'); // Default to English

    const recognitionRef = useRef(null);
    const isListeningRef = useRef(false);

    // Check browser support
    const isSupported = useCallback(() => {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }, []);

    // Initialize speech recognition
    const initRecognition = useCallback(() => {
        if (!isSupported()) {
            setError('Web Speech API not supported');
            return null;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        // Configuration
        recognition.continuous = true;      // Keep listening
        recognition.interimResults = false; // Only final results
        recognition.lang = language;        // Current language
        recognition.maxAlternatives = 3;    // Get alternatives for better matching

        recognition.onresult = (event) => {
            const lastResult = event.results[event.results.length - 1];

            if (lastResult.isFinal) {
                for (let i = 0; i < lastResult.length; i++) {
                    const transcript = lastResult[i].transcript.trim().toLowerCase();
                    const confidence = lastResult[i].confidence;

                    console.log(`Voice: "${transcript}" (confidence: ${confidence})`);
                    setLastTranscript(transcript);

                    if (confidence >= CONFIDENCE_THRESHOLD) {
                        // Check for start commands
                        if (COMMANDS.START.some(cmd => transcript.includes(cmd.toLowerCase()))) {
                            console.log('✅ START command recognized!');
                            setLastCommand({ type: 'START', transcript, confidence, timestamp: new Date() });
                            if (onStart) onStart();
                            break;
                        }

                        // Check for stop commands
                        if (COMMANDS.STOP.some(cmd => transcript.includes(cmd.toLowerCase()))) {
                            console.log('⏹️ STOP command recognized!');
                            setLastCommand({ type: 'STOP', transcript, confidence, timestamp: new Date() });
                            if (onStop) onStop();
                            break;
                        }
                    }
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);

            // Handle specific errors
            if (event.error === 'not-allowed') {
                setError('Microphone permission denied');
                setIsListening(false);
                isListeningRef.current = false;
            } else if (event.error === 'network') {
                setError('Network error - cannot connect to speech service');
            } else if (event.error !== 'aborted') {
                setError(`Speech recognition error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            // Auto-restart if still in listening mode
            if (isListeningRef.current) {
                try {
                    recognition.start();
                } catch (e) {
                    console.log('Restart failed:', e);
                }
            }
        };

        return recognition;
    }, [isSupported, onStart, onStop, language]);

    // Start listening
    const startListening = useCallback(() => {
        if (isListeningRef.current) {
            console.log('Already listening');
            return;
        }

        if (!isSupported()) {
            setError('Speech recognition not supported in this browser');
            return;
        }

        try {
            // Reinitialize to pick up language changes
            recognitionRef.current = initRecognition();

            if (recognitionRef.current) {
                recognitionRef.current.start();
                isListeningRef.current = true;
                setIsListening(true);
                setError(null);
                console.log(`Voice command listening started (${language})`);
            }
        } catch (err) {
            console.error('Failed to start listening:', err);
            setError(`Failed to start speech recognition: ${err.message}`);
        }
    }, [isSupported, initRecognition, language]);

    // Stop listening
    const stopListening = useCallback(() => {
        isListeningRef.current = false;
        setIsListening(false);

        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.log('Stop failed:', e);
            }
        }

        console.log('Voice command listening stopped');
    }, []);

    // Toggle language
    const toggleLanguage = useCallback((lang) => {
        setLanguage(lang);
        // Restart listening if active
        if (isListeningRef.current) {
            stopListening();
            setTimeout(() => startListening(), 100);
        }
    }, [stopListening, startListening]);

    // Clear last command
    const clearLastCommand = useCallback(() => {
        setLastCommand(null);
        setLastTranscript('');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isListeningRef.current = false;
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore
                }
            }
        };
    }, []);

    return {
        // State
        isListening,
        lastCommand,
        lastTranscript,
        error,
        language,

        // Actions
        startListening,
        stopListening,
        clearLastCommand,
        toggleLanguage,

        // Utils
        isSupported: isSupported()
    };
}
