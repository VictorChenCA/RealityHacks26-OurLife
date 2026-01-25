/**
 * ARPhotoDisplay - 3D Photo Overlay for WebXR
 * Displays captured photos in a "holographic" frame during TTS playback
 * Uses vanilla useFrame for animations to avoid extra dependencies.
 */

import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Image } from '@react-three/drei';
import { useRef } from 'react';

/**
 * Animated Photo Frame
 */
function PhotoFrame({ url, caption }) {
    const groupRef = useRef();

    // Simple animation using lerp in useFrame
    useFrame((state, delta) => {
        if (groupRef.current) {
            // Scale up gently from 0 to 1
            groupRef.current.scale.x += (1 - groupRef.current.scale.x) * 5 * delta;
            groupRef.current.scale.y += (1 - groupRef.current.scale.y) * 5 * delta;
            groupRef.current.scale.z += (1 - groupRef.current.scale.z) * 5 * delta;
        }
    });

    return (
        <group
            ref={groupRef}
            position={[0, 1.2, -1.2]} // Lower than before (was 1.5)
            scale={0.1} // Start small (animated to 1)
        >
            {/* Glass Background / Frame */}
            <RoundedBox args={[0.9, 0.7, 0.05]} radius={0.05} smoothness={4}> {/* Smaller Frame 0.9x0.7 */}
                <meshPhysicalMaterial
                    color="#000"
                    transmission={0.6}
                    roughness={0.2}
                    metalness={0.5}
                    transparent
                    opacity={0.8}
                    thickness={0.1}
                    clearcoat={1}
                />
            </RoundedBox>

            {/* Photo Image using Drei Image (handles aspect ratio and loading) */}
            <group position={[0, 0.05, 0.03]}>
                <Image
                    url={url}
                    scale={[0.8, 0.55]} // Smaller image
                    transparent
                    opacity={1}
                    radius={0.02}
                />
            </group>

            {/* Caption / Helper Text */}
            <Text
                position={[0, -0.3, 0.04]}
                fontSize={0.04} // Smaller Text
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={0.8} // Wrap tighter
                textAlign="center"
            >
                {caption || "Captured Moment"}
            </Text>
        </group>
    );
}

export function ARPhotoDisplay({ isVisible, photoUrl, caption }) {
    if (!isVisible || !photoUrl) return null;

    return (
        <PhotoFrame url={photoUrl} caption={caption} />
    );
}
