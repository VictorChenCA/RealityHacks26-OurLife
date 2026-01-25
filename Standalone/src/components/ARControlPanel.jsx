/**
 * ARControlPanel - Interactive control panel in AR space
 * "Super Cool" Glassmorphism Design
 */

import { useState, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import { Interactive, useXR } from '@react-three/xr';
import * as THREE from 'three';

// Panel position in AR space - Floating Dashboard
const PANEL_POSITION = [-0.6, 1.3, -0.8];

/**
 * Premium 3D Button
 */
function ARButton({ position, label, onClick, active, color = '#22d3ee', activeColor = '#f472b6', width = 0.35, height = 0.08 }) {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef();

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Smooth scale animation
            const targetScale = hovered ? 1.05 : 1;
            meshRef.current.scale.x += (targetScale - meshRef.current.scale.x) * 10 * delta;
            meshRef.current.scale.y += (targetScale - meshRef.current.scale.y) * 10 * delta;
            meshRef.current.scale.z = hovered ? 1.5 : 1; // Pop out effect

            // Pulse effect if active
            if (active) {
                const pulse = (Math.sin(state.clock.elapsedTime * 3) + 1) / 2; // 0 to 1
                meshRef.current.material.emissiveIntensity = 0.5 + (pulse * 0.5);
            } else {
                meshRef.current.material.emissiveIntensity = hovered ? 0.4 : 0.1;
            }
        }
    });

    const handleSelect = useCallback(() => {
        if (onClick) onClick();
    }, [onClick]);

    return (
        <group position={position}>
            <Interactive
                onSelect={handleSelect}
                onHover={() => setHovered(true)}
                onBlur={() => setHovered(false)}
            >
                <RoundedBox
                    ref={meshRef}
                    args={[width, height, 0.02]}
                    radius={0.01}
                    smoothness={4}
                    onClick={handleSelect}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                >
                    <meshStandardMaterial
                        color={active ? activeColor : color}
                        emissive={active ? activeColor : color}
                        emissiveIntensity={0.1}
                        roughness={0.2}
                        metalness={0.8}
                    />
                </RoundedBox>
            </Interactive>
            <Text
                position={[0, 0, 0.02]}
                fontSize={0.03}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {label}
            </Text>
        </group>
    );
}

/**
 * Main AR Control Panel
 */
export function ARControlPanel({
    isRecording,
    isProcessing,
    autoCycleEnabled,
    onStartRecording,
    onStopRecording,
    onStartAutoCycle,
    onStopAutoCycle
}) {
    const [isMinimized, setIsMinimized] = useState(false);
    const panelRef = useRef();

    useFrame((state, delta) => {
        // HUD Behavior: Follow camera smoothly
        if (panelRef.current) {
            const camera = state.camera;

            // Target position: 0.8m in front of camera AND 0.3m DOWN (lowered view)
            const targetPos = camera.position.clone()
                .add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(0.8))
                .add(new THREE.Vector3(0, -0.3, 0));

            // Look at user (billboard) - Safe distance check
            if (panelRef.current.position.distanceTo(camera.position) > 0.05) {
                panelRef.current.lookAt(camera.position);
            }

            // Smooth follow
            panelRef.current.position.lerp(targetPos, 5 * delta);
        }
    });

    return (
        // Initial position set to [0, 1.3, -1] (lower than before) to ensure visibility on mount
        <group ref={panelRef} scale={0.5} position={[0, 1.3, -1]}>
            {/* Glass Dashboard Body */}
            <group visible={!isMinimized}>
                {/* Main Glass Panel */}
                <RoundedBox args={[0.5, 0.4, 0.01]} radius={0.03} smoothness={4}>
                    <meshPhysicalMaterial
                        color="#0f172a" // Dark Blue/Slate
                        transmission={0.9} // High transmission for glass
                        roughness={0.0}
                        metalness={0.1}
                        thickness={0.05}
                        clearcoat={1}
                        opacity={0.7}
                        transparent
                    />
                </RoundedBox>

                {/* Border Glow */}
                <RoundedBox args={[0.51, 0.41, 0.005]} radius={0.03} smoothness={4} position={[0, 0, -0.001]}>
                    <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
                </RoundedBox>

                {/* Header */}
                <Text
                    position={[0, 0.15, 0.02]}
                    fontSize={0.035}
                    color="#38bdf8" // Sky Blue
                    anchorX="center"
                    maxWidth={0.4}
                >
                    MEMORY ASSISTANT
                </Text>

                {/* Status Badge */}
                <group position={[0, 0.08, 0.02]}>
                    <Text
                        fontSize={0.025}
                        color={isProcessing ? "#fbbf24" : isRecording ? "#ef4444" : "#94a3b8"}
                        anchorX="center"
                    >
                        {isProcessing ? '⚡ PROCESSING AI...' : isRecording ? '● REC (Continuous)' : '○ IDLE'}
                    </Text>
                </group>

                {/* Controls Area */}
                <group position={[0, -0.05, 0.02]}>
                    {/* Auto Mode Toggle */}
                    <ARButton
                        position={[0, 0.06, 0]}
                        label={autoCycleEnabled ? 'STOP AUTO' : 'START AUTO'}
                        active={autoCycleEnabled}
                        onClick={autoCycleEnabled ? onStopAutoCycle : onStartAutoCycle}
                        color="#0ea5e9"
                        activeColor="#ef4444"
                    />

                    {/* Manual Override */}
                    <ARButton
                        position={[0, -0.06, 0]}
                        label={isRecording ? 'STOP MIC' : 'START MIC'}
                        active={isRecording}
                        onClick={isRecording ? onStopRecording : onStartRecording}
                        color="#475569"
                        activeColor="#f59e0b"
                        width={0.35}
                        height={0.06}
                    />
                </group>
            </group>

            {/* Minimize Toggle (Floating Sphere) */}
            <group position={isMinimized ? [0, 0, 0] : [0.28, 0.22, 0]}>
                <Interactive onSelect={() => setIsMinimized(!isMinimized)}>
                    <mesh onClick={() => setIsMinimized(!isMinimized)}>
                        <sphereGeometry args={[0.03, 32, 32]} />
                        <meshStandardMaterial
                            color="#38bdf8"
                            emissive="#38bdf8"
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                </Interactive>
            </group>
        </group>
    );
}
