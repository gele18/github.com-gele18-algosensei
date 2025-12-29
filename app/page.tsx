"use client"

import { useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type * as THREE from "three"

function AnimatedSphere({
  position,
  color,
  size,
}: { position: [number, number, number]; color: string; size: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Sphere ref={meshRef} args={[size, 32, 32]} position={position}>
      <MeshDistortMaterial color={color} attach="material" distort={0.3} speed={1.5} roughness={0.4} />
    </Sphere>
  )
}

function WireframeGeometry() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.05
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08
    }
  })

  return (
    <mesh ref={meshRef} scale={3}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#14b8a6" wireframe transparent opacity={0.15} />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <WireframeGeometry />
      <AnimatedSphere position={[-2, 1, 0]} color="#ffffff" size={0.15} />
      <AnimatedSphere position={[2, -1, 0]} color="#14b8a6" size={0.2} />
      <AnimatedSphere position={[-3, -2, 2]} color="#ffffff" size={0.12} />
      <AnimatedSphere position={[3, 2, -1]} color="#14b8a6" size={0.18} />
      <AnimatedSphere position={[0, 3, 1]} color="#ffffff" size={0.1} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </>
  )
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <Link href="/" className="text-2xl font-bold text-white">
          <span className="text-cyan-400">Algo</span>Sensei
        </Link>
        <div className="flex gap-8 text-sm font-medium text-gray-300">
          <Link href="/login" className="hover:text-cyan-400 transition-colors">
            Login
          </Link>
          <Link href="/strategy" className="hover:text-cyan-400 transition-colors">
            Strategy
          </Link>
          <Link href="/community" className="hover:text-cyan-400 transition-colors">
            Community
          </Link>
          <Link href="/studio" className="hover:text-cyan-400 transition-colors">
            Studio
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-balance">
          <span className="text-cyan-400">Algo</span>
          <span className="text-white">Sensei</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl text-balance">
          Build, backtest, and deploy algorithmic trading strategies with AI-powered simplicity
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/login">
            <Button size="lg" className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold px-8 py-6 text-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
