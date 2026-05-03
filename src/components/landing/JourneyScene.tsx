"use client";

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Grid, Float, Stars, Bloom, EffectComposer } from '@react-three/drei';
import * as THREE from 'three';
import { journeyNodes } from '@/data/journeyNodes';
import JourneyNode from './JourneyNode';
import JourneyCharacter from './JourneyCharacter';

interface JourneySceneProps {
  progress: number;
}

export const JourneyScene = ({ progress }: JourneySceneProps) => {
  const { mouse } = useThree();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const roadGroupRef = useRef<THREE.Group>(null);

  // Define the snake road curve
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5, 0, -8),
      new THREE.Vector3(-2, 0, -5),
      new THREE.Vector3(5, 0, -4),
      new THREE.Vector3(3, 0, -1),
      new THREE.Vector3(-5, 0, 0),
      new THREE.Vector3(-2, 0, 3),
      new THREE.Vector3(5, 0, 4),
      new THREE.Vector3(2, 0, 6),
      new THREE.Vector3(0, 0, 8),
    ]);
  }, []);

  // Road Particles
  const particles = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 80; i++) {
      const p = curve.getPointAt(i / 80);
      pts.push(p);
    }
    return pts;
  }, [curve]);

  // City Lights / Background depth
  const cityLights = useMemo(() => {
    const lights = [];
    for (let i = 0; i < 200; i++) {
      lights.push({
        position: [
          (Math.random() - 0.5) * 60,
          Math.random() * 10,
          -20 - Math.random() * 30
        ],
        color: Math.random() > 0.5 ? '#10B981' : '#FFFFFF',
        intensity: 0.5 + Math.random() * 1.5
      });
    }
    return lights;
  }, []);

  useFrame((state) => {
    if (cameraRef.current) {
      // Camera breathing effect
      const t = state.clock.getElapsedTime();
      const driftY = Math.sin(t * 0.5) * 0.1;
      
      // Mouse parallax
      const targetX = mouse.x * 0.5;
      const targetY = 8 + mouse.y * 0.5;
      
      cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.05;
      cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.05;
      cameraRef.current.lookAt(0, 0, 0);

      // FOV zoom for end node
      const targetFOV = progress > 0.9 ? 44 : 50;
      cameraRef.current.fov += (targetFOV - cameraRef.current.fov) * 0.05;
      cameraRef.current.updateProjectionMatrix();
    }
  });

  return (
    <>
      <PerspectiveCamera 
        ref={cameraRef} 
        makeDefault 
        position={[0, 8, 18]} 
        fov={50} 
      />

      <color attach="background" args={['#060D14']} />
      <fog attach="fog" args={['#060D14', 15, 35]} />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={40} color="#1E2A3A" />
      <hemisphereLight args={['#10B981', '#060D14', 0.1]} />

      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      {cityLights.map((light, i) => (
        <mesh key={i} position={light.position as [number, number, number]}>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshStandardMaterial color={light.color} emissive={light.color} emissiveIntensity={light.intensity} />
        </mesh>
      ))}

      {/* Ground Plane */}
      <Grid 
        infiniteGrid 
        fadeDistance={30} 
        fadeStrength={5} 
        cellSize={1} 
        sectionSize={5} 
        sectionColor="#10B981" 
        sectionThickness={1} 
        cellColor="#10B981" 
        cellThickness={0.5} 
        position={[0, -0.01, 0]} 
      />

      {/* The Road */}
      <group ref={roadGroupRef}>
        {/* Unlit path */}
        <mesh>
          <tubeGeometry args={[curve, 200, 0.18, 12, false]} />
          <meshStandardMaterial 
            color="#0F2A1E" 
            emissive="#061A10" 
            roughness={0.8} 
            transparent 
            opacity={0.8}
          />
        </mesh>

        {/* Traveled path - built dynamically or using custom shader */}
        {/* Simplified: just show a thin glowing wire for the traveled part */}
        <mesh>
           <tubeGeometry args={[curve, 200, 0.2, 12, false]} />
           <meshStandardMaterial 
             color="#10B981" 
             emissive="#10B981" 
             emissiveIntensity={0.6} 
             transparent 
             opacity={0.3} 
             depthWrite={false}
           />
        </mesh>

        {/* Road Edge Particles */}
        {particles.map((pt, i) => (
          <Float key={i} speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh position={pt}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color="#10B981" transparent opacity={0.4} />
            </mesh>
          </Float>
        ))}
      </group>

      {/* Character */}
      <JourneyCharacter curve={curve} progress={progress} />

      {/* Nodes */}
      {journeyNodes.map((node, i) => (
        <JourneyNode 
          key={node.id}
          position={curve.getPointAt(node.t)}
          label={node.title}
          step={node.step}
          active={progress >= node.t}
          isLast={i === journeyNodes.length - 1}
        />
      ))}

      {/* Effects */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.6} 
          mipmapBlur 
          intensity={0.8} 
          radius={0.4} 
        />
      </EffectComposer>
    </>
  );
};

export default JourneyScene;
