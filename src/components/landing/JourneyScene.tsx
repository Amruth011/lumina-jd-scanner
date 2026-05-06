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
import { gsap } from "@/lib/gsap";

interface JourneySceneProps {
  progressRef: React.MutableRefObject<number>;
}

export const JourneyScene: React.FC<JourneySceneProps> = ({ progressRef }) => {
  const { camera, mouse } = useThree();
  const roadRef = useRef<THREE.Mesh>(null);
  const traveledRoadRef = useRef<THREE.Mesh>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);
  
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
    const progress = progressRef.current;
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

    if (spotLightRef.current) {
      spotLightRef.current.intensity = progress > 0.95 ? 250 : 120;
    }

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
      if ((camera as THREE.PerspectiveCamera).fov !== 50) {
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
      <color attach="background" args={['#10B981']} />
      <fog attach="fog" args={['#10B981', 10, 40]} />
      
      <PerspectiveCamera makeDefault position={[0, 8, 18]} fov={50} />
      
      <ambientLight intensity={0.8} color="#10B981" />
      <pointLight position={[0, 5, 0]} intensity={100} color="#1E2A3A" />
      <spotLight 
        ref={spotLightRef}
        position={[0, 10, 8]} 
        color="#10B981" 
        angle={0.4}
        penumbra={1}
        castShadow
      />
      <hemisphereLight args={['#10B981', '#1E2A3A', 0.4]} />

      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0D1F2D" roughness={0.8} metalness={0.2} />
      </mesh>
      
      <Grid 
        infiniteGrid 
        fadeDistance={40} 
        fadeStrength={8} 
        cellSize={1} 
        sectionSize={5} 
        sectionColor="#10B981"
        sectionThickness={2.5}
        cellColor="#1E2A3A"
        cellThickness={1.5}
      />

      {/* The Road */}
      <mesh ref={roadRef}>
        <tubeGeometry args={[curve, 200, 0.2, 12, false]} />
        <meshStandardMaterial 
          color="#1E2A3A" 
          emissive="#1E2A3A" 
          emissiveIntensity={0.2}
          roughness={0.4} 
        />
      </mesh>

      {/* Traveled Road (Glowing) */}
      <mesh ref={traveledRoadRef}>
        {/* Geometry updated in useFrame */}
        <meshStandardMaterial 
          color="#10B981" 
          emissive="#10B981" 
          emissiveIntensity={2.0} 
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
      <JourneyCharacter curve={curve} progressRef={progressRef} />

      {/* The Nodes */}
      {journeyNodes.map((node, index) => (
        <JourneyNode 
          key={node.id}
          position={curve.getPointAt(node.t)}
          number={(index + 1).toString().padStart(2, '0')}
          label={node.title}
          progressRef={progressRef}
          nodeT={node.t}
          isSpecial={index === 4}
        />
      ))}

      {/* Ambient Extras */}
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* Post Processing */}
      <EffectComposer enableNormalPass={false}>
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
      (ref.current.material as THREE.MeshBasicMaterial).opacity = opacity * (1 - ref.current.position.y / 4);
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
