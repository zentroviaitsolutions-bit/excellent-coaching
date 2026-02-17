'use client'

import { Canvas } from '@react-three/fiber'
import { Float, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'

function FloatingCard(props) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1} {...props}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.1, 3, 0.18]} />
        <meshStandardMaterial
          color='#fb923c' // light orange
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>
    </Float>
  )
}

export function NotFoundScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 45 }}
      shadows
      className='absolute inset-0 -z-10'
    >
      {/* light pastel background */}
      <color attach='background' args={['#f9fafb']} />{' '}
      {/* Tailwind slate-50-ish */} [web:38][web:40]
      {/* bright, soft lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight
        intensity={1.2}
        position={[5, 6, 4]}
        color='#f97316'
        castShadow
      />
      <directionalLight
        intensity={0.7}
        position={[-5, -3, -4]}
        color='#6366f1'
      />
      <directionalLight intensity={0.4} position={[0, 4, -6]} color='#ffffff' />
      <Suspense fallback={null}>
        {/* main center card */}
        <FloatingCard position={[0, 0, 0]} />

        {/* side “pages” */}
        <FloatingCard position={[-3.4, 1.6, -1]} rotation={[0.1, 0.6, -0.4]} />
        <FloatingCard
          position={[3.2, -1.8, -1.5]}
          rotation={[-0.3, -0.4, 0.5]}
        />
        <FloatingCard position={[0.4, 2.6, -2]} rotation={[0.2, -0.3, 0.15]} />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  )
}
