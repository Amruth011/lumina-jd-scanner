/* use client */
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';
import { journeyNodes } from '../../data/journeyNodes';

interface JourneyCharacterProps {
  scrollProgressRef: React.MutableRefObject<number>;
}

export const JourneyCharacter: React.FC<JourneyCharacterProps> = ({ scrollProgressRef }) => {
  const meshRef = useRef<THREE.Group>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);

  // Build same curve as Road component
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const spacing = 30;
    journeyNodes.forEach((_, i) => {
      pts.push(new THREE.Vector3(0, 0, -i * spacing));
    });
    return pts;
  }, []);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2), [points]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const progress = scrollProgressRef.current; // 0..1
    const point = curve.getPointAt(progress);
    const time = state.clock.getElapsedTime();
    const bob = Math.sin(time * 2) * 0.08;

    meshRef.current.position.set(point.x, point.y + 0.5 + bob, point.z);
    // orient forward a bit
    const lookAtPoint = curve.getPointAt(Math.min(progress + 0.01, 1));
    meshRef.current.lookAt(lookAtPoint.x, lookAtPoint.y + 0.5 + bob, lookAtPoint.z);

    if (pointLightRef.current) {
      pointLightRef.current.position.copy(meshRef.current.position);
    }
  });

  return (
    <group>
      <group ref={meshRef}>
        {/* Glow Ring */}
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[0.35, 0.02, 8, 32]} />
          <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={2} />
        </mesh>
        {/* Character Capsule */}
        <mesh>
          <capsuleGeometry args={[0.2, 0.3, 8, 16]} />
          <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={1.5} />
        </mesh>
        {/* Trail effect */}
        <Trail width={1.5} length={4} color={new THREE.Color('#10B981')} attenuation={(t) => t * t} />
      </group>
      <pointLight ref={pointLightRef} intensity={80} distance={5} color="#10B981" decay={2} />
    </group>
  );
};

export default JourneyCharacter;
