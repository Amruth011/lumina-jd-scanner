"use client"
import React from 'react'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

export const CityLights = () => {
  // simple scattered light points to simulate distant city lights
  const count = 100
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40 // x
    positions[i * 3 + 1] = Math.random() * 10 + 5 // y above ground
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40 // z
  }
  return (
    <group>
      <Points positions={positions} stride={3}>
        <PointMaterial
          color="#ffffff"
          size={0.2}
          sizeAttenuation={true}
          depthWrite={false}
          transparent={true}
          opacity={0.4}
        />
      </Points>
    </group>
  )
}

export default CityLights;
