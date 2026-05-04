import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, CatmullRomCurve3, Quaternion } from 'three';
import { Trail, Float } from '@react-three/drei';

interface JourneyCharacterProps {
  curve: CatmullRomCurve3;
  progress: number;
}

export const JourneyCharacter: React.FC<JourneyCharacterProps> = ({ curve, progress }) => {
  const meshRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  
  // Base bobbing and floating handled by Float component, but we need manual position
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Get position on curve
    const pos = curve.getPointAt(progress);
    meshRef.current.position.set(pos.x, pos.y + 0.3, pos.z);
    
    // Get tangent for rotation
    const tangent = curve.getTangentAt(progress).normalize();
    const up = new Vector3(0, 1, 0);
    const axis = new Vector3().crossVectors(up, tangent).normalize();
    const angle = Math.acos(up.dot(tangent));
    meshRef.current.quaternion.setFromAxisAngle(axis, angle);
    
    // Ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.05;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <capsuleGeometry args={[0.2, 0.3, 8, 16]} />
        <meshStandardMaterial 
          color="#10B981" 
          emissive="#10B981" 
          emissiveIntensity={1.2} 
        />
        
        {/* Outer glow ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.02, 8, 32]} />
          <meshStandardMaterial 
            color="#10B981" 
            emissive="#10B981" 
            emissiveIntensity={2} 
          />
        </mesh>

        {/* Trail effect */}
        <Trail
          width={1.5}
          length={8}
          color="#10B981"
          attenuation={(t) => t * t}
        />
      </mesh>
      
      {/* Light that follows the character */}
      <pointLight 
        intensity={80} 
        distance={10} 
        color="#10B981" 
        position={[0, 0.5, 0]} 
      />
    </group>
  );
};
