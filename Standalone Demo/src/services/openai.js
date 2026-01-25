/**
 * OpenAI Service - Whisper 및 GPT-4 통합
 * Handles audio transcription and text summarization
 * 
 * API Endpoints:
 * - Whisper: https://api.openai.com/v1/audio/transcriptions
 * - GPT-4: https://api.openai.com/v1/chat/completions
 * 
 * Pricing (approximate):
 * - Whisper: $0.006 per minute
 * - GPT-4: $0.03 per 1K input tokens, $0.06 per 1K output tokens
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Retry helper with exponential backoff
 */
async function withRetry(fn, retries = MAX_RETRIES) {
    let lastError;

    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on authentication errors
            if (error.status === 401 || error.status === 403) {
                throw error;
            }

            // Wait before retry (exponential backoff)
            if (i < retries - 1) {
                await new Promise(r => setTimeout(r, RETRY_DELAY_MS * Math.pow(2, i)));
                console.log(`Retrying... attempt ${i + 2}/${retries}`);
            }
        }
    }

    throw lastError;
}

/**
 * Transcribe audio using Whisper API
 * 
 * @param {Blob} audioBlob - Audio file as Blob (webm, mp3, mp4, etc.)
 * @returns {Promise<string>} - Transcribed text
 * 
 * API Details:
 * - Endpoint: POST https://api.openai.com/v1/audio/transcriptions
 * - Body: FormData with file and model
 * - Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, webm
 */
export async function transcribeAudio(audioBlob, mimeType = 'audio/webm') {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-your-key-here') {
        throw new Error('OpenAI API key not configured. Set VITE_OPENAI_KEY in .env file.');
    }

    if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Empty audio blob provided');
    }

    // Determine extension based on MIME type
    let extension = 'webm';
    if (mimeType.includes('mp4') || mimeType.includes('m4a')) {
        extension = 'm4a'; // Use m4a for audio-only mp4 container
    } else if (mimeType.includes('wav')) {
        extension = 'wav';
    } else if (mimeType.includes('mp3')) {
        extension = 'mp3';
    }

    return withRetry(async () => {
        // Create FormData with audio file
        const formData = new FormData();
        formData.append('file', audioBlob, `recording.${extension}`);
        formData.append('model', 'whisper-1');
        // Don't set language - let Whisper auto-detect Korean or English
        formData.append('response_format', 'json');

        console.log(`Transcribing audio... (size: ${(audioBlob.size / 1024).toFixed(1)}KB)`);

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`
                // Note: Don't set Content-Type for FormData - browser sets it with boundary
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.error?.message || `Whisper API error: ${response.status}`);
            error.status = response.status;
            throw error;
        }

        const data = await response.json();
        console.log('Transcription complete:', data.text?.substring(0, 100) + '...');

        return data.text || '';
    });
}

/**
 * Summarize text using GPT-4 API
 * 
 * @param {string} text - Text to summarize
 * @returns {Promise<string>} - One-sentence summary in Korean
 * 
 * API Details:
 * - Endpoint: POST https://api.openai.com/v1/chat/completions
 * - Model: gpt-4o-mini (fast and cost-effective)
 */
export async function summarizeText(text) {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-your-key-here') {
        throw new Error('OpenAI API key not configured');
    }

    if (!text || text.trim().length === 0) {
        return '(음성 내용 없음)';
    }

    return withRetry(async () => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Fast and cost-effective
                messages: [
                    {
                        role: 'system',
                        content: `You are an AI assistant helping Alzheimer's patients remember their activities.
Help users remember what they just did.

Read the following voice recording transcript and summarize it in 2-3 sentences.
- Clearly explain what the user was doing
- Include important details (names, places, topics)
- Respond in the SAME LANGUAGE as the input (Korean or English)
- Be warm and friendly

Example (Korean): "점심을 드시고 딸 수진씨와 전화 통화를 하셨습니다. 주말에 같이 공원에 가기로 약속하셨어요."
Example (English): "You had lunch and talked with your daughter Susan on the phone. You planned to visit the park together this weekend."`
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                max_tokens: 200,
                temperature: 0.3 // Lower temperature for consistent summaries
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.error?.message || `GPT API error: ${response.status}`);
            error.status = response.status;
            throw error;
        }

        const data = await response.json();
        const summary = data.choices?.[0]?.message?.content?.trim() || '(요약 생성 실패)';

        console.log('Summary generated:', summary);
        return summary;
    });
}

/**
 * Combined pipeline: Audio -> Transcription -> Summary
 * 
 * @param {Blob} audioBlob - Audio recording
 * @returns {Promise<{transcript: string, summary: string, timestamp: Date}>}
 */
export async function processAudioToSummary(audioBlob, mimeType = 'audio/webm') {
    const timestamp = new Date();

    try {
        // Step 1: Transcribe audio to text
        const transcript = await transcribeAudio(audioBlob, mimeType);

        // Step 2: Summarize the transcript
        const summary = await summarizeText(transcript);

        return {
            transcript,
            summary,
            timestamp,
            success: true
        };
    } catch (error) {
        console.error('Audio processing failed:', error);
        return {
            transcript: '',
            summary: `(처리 오류: ${error.message})`,
            timestamp,
            success: false,
            error: error.message
        };
    }
}

/**
 * Generate speech from text using OpenAI TTS
 * 
 * @param {string} text - Text to speak
 * @param {string} voice - 'alloy', 'echo', 'fable', 'onyx', 'nova', or 'shimmer'
 * @returns {Promise<Blob>} - Audio blob (mp3)
 * 
 * API Details:
 * - Endpoint: POST https://api.openai.com/v1/audio/speech
 * - Model: tts-1 (low latency)
 * - Cost: $0.015 / 1K characters
 */
export async function generateSpeech(text, voice = 'nova') {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-your-key-here') {
        throw new Error('OpenAI API key not configured');
    }

    return withRetry(async () => {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'tts-1',
                input: text,
                voice: voice,
                response_format: 'mp3'
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `TTS API error: ${response.status}`);
        }

        const blob = await response.blob();
        console.log(`Speech generated: ${(blob.size / 1024).toFixed(1)}KB`);
        return blob;
    });
}

/**
 * Test API connection
 * Useful for verifying API key is working
 */
export async function testAPIConnection() {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-your-key-here') {
        return { success: false, error: 'API key not configured' };
    }

    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            }
        });

        if (response.ok) {
            return { success: true, message: 'API connection successful' };
        } else {
            const data = await response.json().catch(() => ({}));
            return {
                success: false,
                error: data.error?.message || `HTTP ${response.status}`
            };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}
