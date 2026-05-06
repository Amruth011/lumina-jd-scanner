import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { gsap } from "@/lib/gsap";

interface JourneyNodeProps {
  position: THREE.Vector3;
  number: string;
  label: string;
  progressRef: React.MutableRefObject<number>;
  nodeT: number;
  isSpecial?: boolean;
}

export const JourneyNode: React.FC<JourneyNodeProps> = ({ 
  position, 
  number, 
  label, 
  progressRef,
  nodeT,
  isSpecial 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const platformRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);

  // Spring for scaling the platform
  const { scale } = useSpring({
    scale: isActive ? (isSpecial ? 1.5 : 1.3) : 1,
    config: { mass: 1, tension: 170, friction: 12 }
  });

  useEffect(() => {
    if (isActive && !hasActivated) {
      setHasActivated(true);
      
      // Flash effect
      if (lightRef.current) {
        gsap.to(lightRef.current, {
          intensity: 120,
          duration: 0.4,
          yoyo: true,
          repeat: 1,
          ease: "power2.out"
        });
      }

      // Emissive burst
      if (platformRef.current) {
        const material = platformRef.current.material as THREE.MeshStandardMaterial;
        gsap.to(material, {
          emissiveIntensity: 1.5,
          duration: 0.6,
          ease: "power2.out"
        });
      }
    }
  }, [isActive, hasActivated, isSpecial]);

  useFrame((state) => {
    const p = progressRef.current;
    if (p >= nodeT && !isActive) {
      setIsActive(true);
    } else if (p < nodeT && isActive) {
      setIsActive(false);
    }

    if (isActive && ringRef.current) {
      // Sonar ping effect
      const t = (state.clock.elapsedTime * 0.8) % 1;
      ringRef.current.scale.set(1 + t * 2, 1 + t * 2, 1);
      const material = ringRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 1 - t;
    }
  });

  return (
    <group position={position} ref={meshRef}>
      {/* Base Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.08, 32]} />
        <meshStandardMaterial 
          color={isActive ? "#10B981" : "#1E2A3A"} 
          emissive={isActive ? "#10B981" : "#0A1520"}
          emissiveIntensity={isActive ? 0.8 : 0.1}
        />
      </mesh>

      {/* Pillar */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
        <meshStandardMaterial color={isActive ? "#10B981" : "#1E2A3A"} />
      </mesh>

      {/* Platform Sphere */}
      <animated.mesh ref={platformRef} position={[0, 1.2, 0]} scale={scale}>
        <sphereGeometry args={[isSpecial ? 0.7 : 0.45, 32, 32]} />
        <meshStandardMaterial 
          color={isActive ? "#10B981" : "#1E2A3A"} 
          emissive={isActive ? "#10B981" : "#0A1520"}
          emissiveIntensity={isActive ? 1.5 : 0.3}
          metalness={isSpecial ? 0.8 : 0.2}
          roughness={isSpecial ? 0.2 : 0.8}
        />
      </animated.mesh>

      {/* Sonar Ring */}
      {isActive && (
        <mesh ref={ringRef} position={[0, 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.02, 8, 32]} />
          <meshBasicMaterial color="#10B981" transparent opacity={0} />
        </mesh>
      )}

      {/* Burst Light */}
      <pointLight 
        ref={lightRef}
        intensity={0}
        distance={5}
        color="#10B981"
        position={[0, 1.2, 0]}
      />

      {/* HTML Labels */}
      <Html position={[0, 2.2, 0]} center distanceFactor={10}>
        <div style={{ 
          fontFamily: 'var(--font-mono)', 
          color: '#10B981', 
          fontSize: '14px',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
        }}>
          {number}
        </div>
      </Html>
      
      <Html position={[0, -0.8, 0]} center distanceFactor={10}>
        <div style={{ 
          fontFamily: 'var(--font-body)', 
          color: 'white', 
          fontSize: '12px',
          whiteSpace: 'nowrap',
          opacity: 0.8
        }}>
          {label}
        </div>
      </Html>
    </group>
  );
};
