/**
 * RecordingIndicator - 녹음 상태 표시
 * Red pulsing sphere when recording is active
 * Position: [0, 2, -1.5] in AR space
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

export function RecordingIndicator({ isRecording, isProcessing }) {
    const sphereRef = useRef();
    const glowRef = useRef();

    // Animate pulsing effect
    useFrame(({ clock }) => {
        if (sphereRef.current && isRecording) {
            const scale = 1 + Math.sin(clock.elapsedTime * 3) * 0.15;
            sphereRef.current.scale.setScalar(scale);
        }
        if (glowRef.current && isRecording) {
            glowRef.current.intensity = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.3;
        }
    });

    if (!isRecording && !isProcessing) {
        return null;
    }

    return (
        <group position={[0, 2.1, -1.5]}>
            {/* Recording indicator sphere */}
            <mesh ref={sphereRef}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshStandardMaterial
                    color={isProcessing ? '#f59e0b' : '#ef4444'}
                    emissive={isProcessing ? '#f59e0b' : '#ef4444'}
                    emissiveIntensity={0.5}
                />
            </mesh>

            {/* Glow effect */}
            <pointLight
                ref={glowRef}
                color={isProcessing ? '#f59e0b' : '#ef4444'}
                intensity={0.5}
                distance={0.3}
            />

            {/* Status text */}
            <Text
                position={[0.12, 0, 0]}
                fontSize={0.04}
                color={isProcessing ? '#f59e0b' : '#ef4444'}
                anchorX="left"
                anchorY="middle"
            >
                {isProcessing ? 'Processing...' : '● Recording'}
            </Text>
        </group>
    );
}
