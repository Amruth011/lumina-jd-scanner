"use client";

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, MeshDistortMaterial, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

const DashboardCard = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        (state.mouse.x * Math.PI) / 10,
        0.1
      );
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        (state.mouse.y * Math.PI) / 10,
        0.1
      );
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        {/* Card Base */}
        <boxGeometry args={[4, 2.5, 0.1]} />
        <meshStandardMaterial color="#1E2A3A" roughness={0.1} metalness={0.8} />
        
        {/* Glow behind */}
        <pointLight position={[0, 0, -1]} intensity={5} color="#10B981" />
        
        {/* Score Ring (visual representation) */}
        <group position={[-1.2, 0, 0.06]}>
          <mesh>
            <ringGeometry args={[0.4, 0.45, 32]} />
            <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={2} />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.4}
            color="#10B981"
            font="https://fonts.gstatic.com/s/outfit/v11/QGYsz_OByL2Gf4T6YN6E.ttf"
          >
            94
          </Text>
        </group>

        {/* Mock Lines */}
        <group position={[0.5, 0, 0.06]}>
          {[0.6, 0.2, -0.2, -0.6].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <planeGeometry args={[1.5, 0.1]} />
              <meshStandardMaterial color="#10B981" opacity={0.3} transparent />
            </mesh>
          ))}
        </group>
      </mesh>
    </Float>
  );
};

export const Hero3DCard = () => {
  return (
    <div className="w-full h-[400px] md:h-[600px] cursor-grab active:cursor-grabbing">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={null}>
          <DashboardCard />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Hero3DCard;
