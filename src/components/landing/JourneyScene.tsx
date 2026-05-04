import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  Grid, 
  Float, 
  Stars,
  useScroll
} from '@react-three/drei';
import * as THREE from 'three';
import { JourneyCharacter } from './JourneyCharacter';
import { JourneyNode } from './JourneyNode';
import { journeyNodes } from '../../data/journeyNodes';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import confetti from 'canvas-confetti';
import gsap from 'gsap';

interface JourneySceneProps {
  progress: number;
}

export const JourneyScene: React.FC<JourneySceneProps> = ({ progress }) => {
  const { camera, mouse } = useThree();
  const roadRef = useRef<THREE.Mesh>(null);
  const traveledRoadRef = useRef<THREE.Mesh>(null);
  
  // Define the snake curve
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5, 0, -8),   // Node 1
      new THREE.Vector3(-2, 0, -5),
      new THREE.Vector3( 5, 0, -4),   // Node 2
      new THREE.Vector3( 3, 0, -1),
      new THREE.Vector3(-5, 0,  0),   // Node 3
      new THREE.Vector3(-2, 0,  3),
      new THREE.Vector3( 5, 0,  4),   // Node 4
      new THREE.Vector3( 2, 0,  6),
      new THREE.Vector3( 0, 0,  8),   // Node 5
    ]);
  }, []);

  // Update traveled road geometry
  useFrame(() => {
    if (traveledRoadRef.current && progress > 0) {
      // We rebuild the tube for the traveled path
      // This is the requested method for the "glowing traveled road"
      const points = curve.getPoints(200);
      const currentPoints = points.slice(0, Math.ceil(progress * 200) + 1);
      
      if (currentPoints.length > 1) {
        const tempCurve = new THREE.CatmullRomCurve3(currentPoints);
        const newGeo = new THREE.TubeGeometry(tempCurve, currentPoints.length * 2, 0.2, 12, false);
        traveledRoadRef.current.geometry.dispose();
        traveledRoadRef.current.geometry = newGeo;
      } else {
        traveledRoadRef.current.geometry = new THREE.BufferGeometry();
      }
    }

    // Camera breathing and parallax
    const time = performance.now() * 0.001;
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
    camera.position.y += (8 + Math.sin(time) * 0.2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    // Node 5 Celebration
    if (progress >= 0.99 && !window.confettiActive) {
      window.confettiActive = true;
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#FFFFFF', '#1E2A3A', '#F59E0B']
      });
      
      // Camera zoom
      gsap.to(camera, {
        fov: 44,
        duration: 1.2,
        ease: "power2.out"
      });
    } else if (progress < 0.95) {
      window.confettiActive = false;
      if (camera.fov !== 50) {
        gsap.to(camera, { fov: 50, duration: 0.8 });
      }
    }
  });

  // Ambient Particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 60; i++) {
      temp.push({
        position: [
          Math.random() * 20 - 10,
          Math.random() * 4,
          Math.random() * 20 - 10
        ],
        speed: 0.01 + Math.random() * 0.02,
        opacity: 0.2 + Math.random() * 0.4
      });
    }
    return temp;
  }, []);

  return (
    <>
      <color attach="background" args={['#060D14']} />
      <fog attach="fog" args={['#060D14', 20, 60]} />
      
      <PerspectiveCamera makeDefault position={[0, 8, 18]} fov={50} />
      
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={40} color="#1E2A3A" />
      <spotLight 
        position={[0, 10, 8]} 
        intensity={progress > 0.95 ? 150 : 60} 
        color="white" 
        angle={0.3}
        penumbra={1}
        castShadow
      />
      <hemisphereLight args={['#10B981', '#060D14', 0.1]} />

      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#060D14" roughness={1} metalness={0} />
      </mesh>
      
      <Grid 
        infiniteGrid 
        fadeDistance={30} 
        fadeStrength={5} 
        cellSize={1} 
        sectionSize={5} 
        sectionColor="#10B981"
        sectionThickness={1.5}
        cellColor="#10B981"
        cellThickness={0.5}
        opacity={0.08}
      />

      {/* The Road */}
      <mesh ref={roadRef}>
        <tubeGeometry args={[curve, 200, 0.18, 12, false]} />
        <meshStandardMaterial 
          color="#0F2A1E" 
          emissive="#061A10" 
          roughness={0.8} 
        />
      </mesh>

      {/* Traveled Road (Glowing) */}
      <mesh ref={traveledRoadRef}>
        {/* Geometry updated in useFrame */}
        <meshStandardMaterial 
          color="#10B981" 
          emissive="#10B981" 
          emissiveIntensity={0.6} 
        />
      </mesh>

      {/* Road Edge Particles */}
      {curve.getPoints(80).map((point, i) => (
        <Float key={i} speed={2} rotationIntensity={0} floatIntensity={0.5}>
          <mesh position={[point.x, point.y + 0.05, point.z]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#10B981" transparent opacity={0.4} />
          </mesh>
        </Float>
      ))}

      {/* The Character */}
      <JourneyCharacter curve={curve} progress={progress} />

      {/* The Nodes */}
      {journeyNodes.map((node, index) => (
        <JourneyNode 
          key={node.id}
          position={curve.getPointAt(node.t)}
          number={(index + 1).toString().padStart(2, '0')}
          label={node.title}
          isActive={progress >= node.t}
          isSpecial={index === 4}
        />
      ))}

      {/* Ambient Extras */}
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          intensity={0.8} 
          luminanceThreshold={0.6} 
          luminanceSmoothing={0.3} 
        />
      </EffectComposer>
    </>
  );
};

interface ParticleProps {
  position: [number, number, number];
  speed: number;
  opacity: number;
}

const Particle = ({ position, speed, opacity }: ParticleProps) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y += speed;
      if (ref.current.position.y > 4) ref.current.position.y = 0;
      ref.current.material.opacity = opacity * (1 - ref.current.position.y / 4);
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.03]} />
      <meshBasicMaterial color="#10B981" transparent opacity={opacity} />
    </mesh>
  );
};

declare global {
  interface Window {
    confettiActive: boolean;
  }
}
