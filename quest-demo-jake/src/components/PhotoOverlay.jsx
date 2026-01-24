/**
 * PhotoOverlay - 사진 오버레이 컴포넌트
 * Shows the captured photo fullscreen during TTS playback
 */

import { useEffect, useState } from 'react';
import './PhotoOverlay.css';

export function PhotoOverlay({ entry, isVisible, onComplete }) {
    const [fadeState, setFadeState] = useState('hidden');

    useEffect(() => {
        if (isVisible && entry) {
            setFadeState('visible');
        } else {
            setFadeState('hidden');
            // If hiding, trigger onComplete after animation
            if (!isVisible && onComplete) {
                const timer = setTimeout(onComplete, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [isVisible, entry, onComplete]);

    if (!entry || fadeState === 'hidden') {
        return null;
    }

    // Format time
    const timeString = entry.timestamp
        ? new Date(entry.timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })
        : '';

    return (
        <div className={`photo-overlay ${fadeState}`}>
            <div className="photo-container">
                {/* Photo */}
                {entry.photo && (
                    <img
                        src={entry.photo}
                        alt="Captured scene"
                        className="captured-photo"
                    />
                )}

                {/* Summary card */}
                <div className="summary-card">
                    <div className="time-badge">{timeString}</div>
                    <p className="summary-text">{entry.summary}</p>
                    <div className="speaking-indicator">
                        🔊 Speaking...
                    </div>
                </div>
            </div>
        </div>
    );
}
