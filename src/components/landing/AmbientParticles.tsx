"use client"
import React from 'react'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

export const AmbientParticles = () => {
  const count = 200
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40
    positions[i * 3 + 1] = Math.random() * 20 + 5
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40
  }
  return (
    <group>
      <Points positions={positions} stride={3}>
        <PointMaterial
          color="#10B981"
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
          transparent={true}
          opacity={0.6}
        />
      </Points>
    </group>
  )
}

export default AmbientParticles
