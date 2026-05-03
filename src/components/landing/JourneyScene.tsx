import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, extend } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { PerspectiveCamera, Vector3, CatmullRomCurve3 } from 'three';
import { Road } from './Road';
import { JourneyCharacter } from './JourneyCharacter';
import { JourneyNode } from './JourneyNode';
import { AmbientParticles } from './AmbientParticles';
import { CityLights } from './CityLights';
import { RoadEdgeParticles } from './RoadEdgeParticles';
import { journeyNodes } from '../../data/journeyNodes';

interface JourneySceneProps {
  scrollProgressRef: React.MutableRefObject<number>;
}

export const JourneyScene: React.FC<JourneySceneProps> = ({ scrollProgressRef }) => {
  const cameraRef = useRef<PerspectiveCamera>(null);
  const mouse = useRef({ x: 0, y: 0 });

  // Camera drift & mouse parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useThree(({ camera }) => {
    cameraRef.current = camera as PerspectiveCamera;
  });

  useThree(({ clock }) => {
    const tick = () => {
      const cam = cameraRef.current;
      if (!cam) return;
      // Slow sinusoidal Y‑rotation drift
      const time = clock.getElapsedTime();
      cam.rotation.y = Math.sin(time * 0.2) * (3 * Math.PI / 180); // ±3°
      // Mouse parallax (small X/Y offsets)
      cam.position.x += (mouse.current.x * 0.5 - cam.position.x) * 0.05;
      cam.position.y += (mouse.current.y * 0.5 - cam.position.y) * 0.05;
      requestAnimationFrame(tick);
    };
    tick();
  });

  return (
    <Canvas
      dpr={Math.min(window.devicePixelRatio, 1.5)}
      frameloop="demand"
      gl={{ antialias: true }}
      camera={{ position: [0, 8, 18], fov: 50 }}
    >
      {/* Lights */}
      <ambientLight intensity={0.3} />
      {/* The point light that follows the character will be added inside JourneyCharacter */}
      <pointLight color="#1E2A3A" intensity={40} position={[0, 5, 0]} />
      <spotLight
        color="#ffffff"
        intensity={60}
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={0.5}
        castShadow
      />
      <hemisphereLight skyColor="#10B981" groundColor="#060D14" intensity={0.1} />
      {/* Fog */}
      <fog attach="fog" args={['#060D14', 20, 60]} />

      {/* Ground plane with grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#060D14" roughness={1} metalness={0} />
      </mesh>
      <gridHelper args={[40, 40, '#10B981', '#10B981']} rotation={[-Math.PI / 2, 0, 0]} />

      {/* Road */}
      <Road scrollProgressRef={scrollProgressRef} />

      {/* Ambient particles */}
      <AmbientParticles />
      <CityLights />
      <RoadEdgeParticles />

      {/* Character */}
      <JourneyCharacter scrollProgressRef={scrollProgressRef} />

      {/* Nodes */}
      {journeyNodes.map((node) => (
        <JourneyNode key={node.id} data={node} scrollProgressRef={scrollProgressRef} />
      ))}

      {/* Bloom post‑processing */}
      <EffectComposer>
        <Bloom intensity={0.8} luminanceThreshold={0.6} luminanceSmoothing={0.3} />
      </EffectComposer>
    </Canvas>
  );
};
