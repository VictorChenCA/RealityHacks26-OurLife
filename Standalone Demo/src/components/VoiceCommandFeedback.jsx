/**
 * VoiceCommandFeedback - 음성 명령 피드백
 * Shows recognized voice commands with fade-out animation
 * Position: [0, 2.2, -1.5] in AR space
 */

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

const FADE_DURATION = 2000; // 2 seconds

export function VoiceCommandFeedback({ lastCommand, isListening }) {
    const [displayCommand, setDisplayCommand] = useState(null);
    const [opacity, setOpacity] = useState(0);
    const fadeTimeoutRef = useRef(null);

    // Show command when received
    useEffect(() => {
        if (lastCommand) {
            setDisplayCommand(lastCommand);
            setOpacity(1);

            // Start fade out after display
            if (fadeTimeoutRef.current) {
                clearTimeout(fadeTimeoutRef.current);
            }

            fadeTimeoutRef.current = setTimeout(() => {
                const fadeInterval = setInterval(() => {
                    setOpacity(prev => {
                        if (prev <= 0.1) {
                            clearInterval(fadeInterval);
                            setDisplayCommand(null);
                            return 0;
                        }
                        return prev - 0.1;
                    });
                }, 100);
            }, FADE_DURATION);
        }

        return () => {
            if (fadeTimeoutRef.current) {
                clearTimeout(fadeTimeoutRef.current);
            }
        };
    }, [lastCommand]);

    // Get command label
    const getCommandLabel = (command) => {
        if (!command) return '';

        switch (command.type) {
            case 'START':
                return '✅ 녹음 시작';
            case 'STOP':
                return '⏹️ 녹음 종료';
            default:
                return command.transcript || '';
        }
    };

    return (
        <group position={[0, 2.25, -1.5]}>
            {/* Listening indicator */}
            {isListening && !displayCommand && (
                <Text
                    fontSize={0.035}
                    color="#22c55e"
                    anchorX="center"
                    anchorY="middle"
                >
                    🎤 음성 명령 대기 중...
                </Text>
            )}

            {/* Command feedback */}
            {displayCommand && (
                <Text
                    fontSize={0.06}
                    color="#22c55e"
                    anchorX="center"
                    anchorY="middle"
                    fillOpacity={opacity}
                >
                    {getCommandLabel(displayCommand)}
                </Text>
            )}
        </group>
    );
}
