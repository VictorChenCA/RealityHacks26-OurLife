/**
 * useTTS - Text-to-Speech hook
 * Uses OpenAI API (tts-1) for high-quality multi-language speech
 * 
 * Features:
 * - Natural human-like voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
 * - Supports Korean, English, Chinese seamlessly
 * - Handles audio playback and cleanup
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { generateSpeech } from '../services/openai';

export function useTTS() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const audioRef = useRef(null);
    const onEndCallbackRef = useRef(null);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                URL.revokeObjectURL(audioRef.current.src);
            }
        };
    }, []);

    // Stop current playback
    const stop = useCallback((clearCallback = true) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsSpeaking(false);
        }
        if (clearCallback && onEndCallbackRef.current) {
            onEndCallbackRef.current = null;
        }
    }, []);

    // Speak text using OpenAI TTS
    const speak = useCallback(async (text, options = {}) => {
        if (!text) return;

        try {
            stop(false); // Stop previous audio but keep the new callback if set externally
            setIsLoading(true);
            setError(null);

            // Determine voice based on language or use default
            // 'nova' is good for general assistance
            // 'shimmer' is clear and feminine
            // 'onyx' is deep and masculine
            const voice = options.voice || 'nova';

            console.log(`Generating speech... "${text.substring(0, 30)}..."`);
            const audioBlob = await generateSpeech(text, voice);

            // Create audio element
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            // Event handlers
            audio.onplay = () => {
                setIsSpeaking(true);
                setIsLoading(false);
                console.log('Audio playback started');
            };

            audio.onended = () => {
                setIsSpeaking(false);
                console.log('Audio playback finished');
                URL.revokeObjectURL(audioUrl); // Cleanup

                if (onEndCallbackRef.current) {
                    onEndCallbackRef.current();
                    onEndCallbackRef.current = null;
                }
            };

            audio.onerror = (e) => {
                console.error('Audio playback error', e);
                setIsSpeaking(false);
                setIsLoading(false);
                setError('Audio playback failed');

                if (onEndCallbackRef.current) {
                    onEndCallbackRef.current(); // Ensure callback runs so loop continues
                    onEndCallbackRef.current = null;
                }
            };

            // Start playing
            await audio.play();

        } catch (err) {
            console.error('TTS generation failed:', err);
            setError(err.message);
            setIsLoading(false);

            // Fallback to browser TTS if API fails?
            // For now, just ensure the loop doesn't hang
            if (onEndCallbackRef.current) {
                onEndCallbackRef.current();
                onEndCallbackRef.current = null;
            }
        }
    }, [stop]);

    // Speak summary helper
    const speakSummary = useCallback((summary, options = {}) => {
        if (!summary) return;

        // Auto-detect language for intro message
        const hasKorean = /[가-힣]/.test(summary);

        let message;
        if (hasKorean) {
            message = `사용자님, 지난 10초간 하신 활동입니다. ${summary}`;
        } else {
            // Assume English for now (covers Chinese too since intro is English)
            // Or we could detect Chinese characters for specific Chinese intro
            const hasChinese = /[\u4e00-\u9fa5]/.test(summary);
            if (hasChinese) {
                message = `用户您好，这是过去10秒的活动总结。 ${summary}`;
            } else {
                message = `Here's what you were doing in the last 10 seconds. ${summary}`;
            }
        }

        if (options.onEnd) {
            onEndCallbackRef.current = options.onEnd;
        }

        speak(message);
    }, [speak]);

    return {
        speak,
        speakSummary,
        stop,
        isSpeaking,
        isLoading,
        error,
        isSupported: true // Since it's API-based, it's supported everywhere with internet
    };
}
