'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'

export default function DesignCanvas() {
  return (
    <div className="w-full h-screen bg-gray-900">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Grid helper for reference */}
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#4b5563"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
        />

        {/* Orbit controls for camera manipulation */}
        <OrbitControls
          makeDefault
          minDistance={2}
          maxDistance={20}
        />

        {/* Sample shape - we'll replace this with user-created designs */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2, 1, 0.1]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      </Canvas>
    </div>
  )
}
