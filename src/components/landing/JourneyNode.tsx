"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface JourneyNodeProps {
  position: THREE.Vector3;
  label: string;
  step: string;
  active: boolean;
  isLast?: boolean;
}

export const JourneyNode = ({ position, label, step, active, isLast }: JourneyNodeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const { scale, emissiveIntensity } = useSpring({
    scale: active ? (isLast ? 1.5 : 1.3) : 1,
    emissiveIntensity: active ? 1.5 : 0.3,
    config: { tension: 170, friction: 12 },
  });

  useFrame((state) => {
    if (ringRef.current && active) {
      const t = state.clock.getElapsedTime();
      const s = 1 + (t % 1) * 0.6;
      ringRef.current.scale.set(s, s, s);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - (t % 1);
    }
  });

  return (
    <group position={position}>
      {/* Base Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.08]} />
        <animated.meshStandardMaterial 
          color="#10B981" 
          emissive="#10B981" 
          emissiveIntensity={emissiveIntensity} 
          transparent 
          opacity={active ? 0.4 : 0.1}
        />
      </mesh>

      {/* Pillar */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2]} />
        <meshStandardMaterial color="#10B981" transparent opacity={active ? 0.3 : 0.05} />
      </mesh>

      {/* Platform Sphere */}
      <animated.mesh ref={meshRef} position={[0, 1.2, 0]} scale={scale}>
        <sphereGeometry args={[isLast ? 0.6 : 0.4]} />
        <animated.meshStandardMaterial 
          color={active ? "#10B981" : "#1E2A3A"} 
          emissive={active ? "#10B981" : "#0A1520"} 
          emissiveIntensity={emissiveIntensity}
          roughness={0.2}
          metalness={0.8}
        />
      </animated.mesh>

      {/* Sonar Ping Effect */}
      {active && (
        <mesh ref={ringRef} position={[0, 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.01, 8, 32]} />
          <meshBasicMaterial color="#10B981" transparent />
        </mesh>
      )}

      {/* Labels */}
      <Html position={[0, 2.2, 0]} center distanceFactor={10}>
        <div className="flex flex-col items-center pointer-events-none select-none">
          <span className="font-mono text-[10px] text-emerald-500 font-bold tracking-widest">{step.split(' ')[1]}</span>
          <span className="font-sans text-[12px] text-white font-bold whitespace-nowrap mt-1">{label}</span>
        </div>
      </Html>
    </group>
  );
};

export default JourneyNode;
