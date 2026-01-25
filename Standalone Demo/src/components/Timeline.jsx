/**
 * Timeline - AR 타임라인 컴포넌트
 * Displays activity summaries in 3D space
 * 
 * Layout:
 * - Vertical timeline at position [0, 1.5, -2]
 * - Cards stacked with 0.5m gaps
 * - Each card: 1.5m wide × 0.4m tall
 */

import { useMemo } from 'react';
import { Text, RoundedBox } from '@react-three/drei';

// Card dimensions
// Card dimensions (Reduced)
const CARD_WIDTH = 1.0; // Was 1.5
const CARD_HEIGHT = 0.25; // Was 0.35
const CARD_DEPTH = 0.02;
const CARD_GAP = 0.3; // Was 0.45

// Timeline position in AR space
const TIMELINE_POSITION = [0, 1.6, -2];

/**
 * Single timeline entry card
 */
function TimelineCard({ entry, index }) {
    const yOffset = -index * CARD_GAP;

    // Format timestamp as HH:MM
    const timeString = useMemo(() => {
        const date = new Date(entry.timestamp);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }, [entry.timestamp]);

    return (
        <group position={[0, yOffset, 0]}>
            {/* Card background */}
            <RoundedBox
                args={[CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH]}
                radius={0.02}
                smoothness={4}
            >
                <meshStandardMaterial
                    color="#1a1a2e"
                    transparent
                    opacity={0.85}
                    metalness={0.1}
                    roughness={0.8}
                />
            </RoundedBox>

            {/* Time indicator - left side */}
            <group position={[-CARD_WIDTH / 2 + 0.15, 0, CARD_DEPTH / 2 + 0.001]}>
                <RoundedBox args={[0.2, 0.2, 0.005]} radius={0.01}>
                    <meshStandardMaterial color="#667eea" />
                </RoundedBox>
                <Text
                    position={[0, 0, 0.01]}
                    fontSize={0.045}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {timeString}
                </Text>
            </group>

            {/* Summary text - right side */}
            <Text
                position={[0.1, 0, CARD_DEPTH / 2 + 0.001]}
                fontSize={0.035} // Smaller font
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={CARD_WIDTH - 0.4} // Enforce wrap
                textAlign="center"
                overflowWrap="break-word"
            >
                {entry.summary}
            </Text>

            {/* Subtle glow effect for recent entries */}
            {index === 0 && (
                <pointLight
                    position={[0, 0, 0.1]}
                    color="#667eea"
                    intensity={0.3}
                    distance={0.5}
                />
            )}
        </group>
    );
}

/**
 * Timeline header
 */
function TimelineHeader({ entryCount }) {
    return (
        <group position={[0, 0.4, 0]}>
            <Text
                fontSize={0.08}
                color="#667eea"
                anchorX="center"
                anchorY="middle"
            >
                📋 Activity Log
            </Text>
            <Text
                position={[0, -0.12, 0]}
                fontSize={0.04}
                color="#888"
                anchorX="center"
                anchorY="middle"
            >
                {entryCount > 0 ? `${entryCount} entries` : 'No entries yet'}
            </Text>
        </group>
    );
}

/**
 * Main Timeline component
 */
export function Timeline({ entries = [] }) {
    return (
        <group position={TIMELINE_POSITION}>
            <TimelineHeader entryCount={entries.length} />

            {entries.map((entry, index) => (
                <TimelineCard
                    key={entry.id || index}
                    entry={entry}
                    index={index}
                />
            ))}

            {/* Empty state */}
            {entries.length === 0 && (
                <Text
                    position={[0, -0.2, 0]}
                    fontSize={0.05}
                    color="#666"
                    anchorX="center"
                    anchorY="middle"
                >
                    Start recording to see activity log
                </Text>
            )}
        </group>
    );
}
