// use client
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CatmullRomCurve3, TubeGeometry, Vector3, MeshStandardMaterial } from 'three';
import { journeyNodes } from '../../data/journeyNodes';

interface RoadProps {
  scrollProgressRef: React.MutableRefObject<number>;
}

export const Road: React.FC<RoadProps> = ({ scrollProgressRef }) => {
  // Build points for the road curve
  const points = useMemo(() => {
    const pts: Vector3[] = [];
    const spacing = 30; // distance between nodes along Z axis
    journeyNodes.forEach((_node, i) => {
      pts.push(new Vector3(0, 0, -i * spacing));
    });
    return pts;
  }, []);

  const curve = useMemo(() => new CatmullRomCurve3(points, false, 'catmullrom', 0.2), [points]);

  // Full road geometry (static background)
  const roadGeometry = useMemo(() => new TubeGeometry(curve, 200, 0.4, 8, false), [curve]);

  // Overlay mesh ref to adjust opacity each frame
  const overlayRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (overlayRef.current) {
      const mat = overlayRef.current.material as MeshStandardMaterial;
      mat.opacity = Math.min(scrollProgressRef.current, 1);
      mat.transparent = true;
      mat.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Background road */}
      <mesh geometry={roadGeometry}>
        <meshStandardMaterial color="#1E2A3A" metalness={0.2} roughness={0.8} />
      </mesh>
      {/* Glowing overlay that fades in with scroll */}
      <mesh ref={overlayRef} geometry={roadGeometry}>
        <meshStandardMaterial
          color="#10B981"
          emissive="#10B981"
          emissiveIntensity={2}
          metalness={0.3}
          roughness={0.5}
          transparent
          opacity={0}
        />
      </mesh>
    </group>
  );
};
