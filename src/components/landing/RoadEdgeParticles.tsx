"use client"
import React from 'react'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

export const RoadEdgeParticles = () => {
  const count = 150
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // positions along the road edges roughly within a radius
    const angle = Math.random() * Math.PI * 2
    const radius = 0.6 + Math.random() * 0.3 // around road radius
    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = Math.random() * 4 // low height
    positions[i * 3 + 2] = Math.sin(angle) * radius
  }
  return (
    <group>
      <Points positions={positions} stride={3}>
        <PointMaterial
          color="#10B981"
          size={0.08}
          sizeAttenuation={true}
          depthWrite={false}
          transparent={true}
          opacity={0.7}
        />
      </Points>
    </group>
  )
}

export default RoadEdgeParticles;
