"use client"

import type React from "react"
import { useState, Suspense, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type * as THREE from "three"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft } from "lucide-react"

function FloatingBar({
  position,
  height,
  delay,
}: { position: [number, number, number]; height: number; delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.y = 0.5 + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.5 + height
      meshRef.current.position.y = meshRef.current.scale.y * 0.5 - 2
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.1, 1, 0.1]} />
      <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={0.5} />
    </mesh>
  )
}

function AnimatedSphere({
  position,
  color,
  size,
}: { position: [number, number, number]; color: string; size: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function LoginScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      {/* Animated bars */}
      {Array.from({ length: 30 }).map((_, i) => {
        const angle = (i / 30) * Math.PI * 2
        const radius = 3
        return (
          <FloatingBar
            key={i}
            position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
            height={Math.random() * 0.5}
            delay={i * 0.3}
          />
        )
      })}
      {/* Floating spheres */}
      <AnimatedSphere position={[-1, 1, 2]} color="#ffffff" size={0.15} />
      <AnimatedSphere position={[2, -0.5, 1]} color="#14b8a6" size={0.2} />
      <AnimatedSphere position={[-2, -1, -1]} color="#6b7280" size={0.12} />
      <AnimatedSphere position={[1.5, 2, -2]} color="#ffffff" size={0.18} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
    </>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        let realIp = "unknown"
        try {
          const ipResponse = await fetch("https://api.ipify.org?format=json")
          const ipData = await ipResponse.json()
          realIp = ipData.ip || "unknown"
        } catch (e) {
          console.error("[v0] Failed to fetch IP:", e)
        }

        await fetch("/api/log-failed-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            reason: error.message,
            ip_address: realIp,
          }),
        })
        throw error
      }

      if (!rememberMe) {
        localStorage.setItem("session_type", "temporary")
      } else {
        localStorage.setItem("session_type", "persistent")
      }

      let realIp = "unknown"
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json")
        const ipData = await ipResponse.json()
        realIp = ipData.ip || "unknown"
        console.log("[v0] Client IP fetched:", realIp)
      } catch (e) {
        console.error("[v0] Failed to fetch IP:", e)
      }

      await fetch("/api/sessions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip_address: realIp }),
      })

      await fetch("/api/log-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_type: "login",
          description: "User logged in successfully",
          severity: "info",
          ip_address: realIp,
        }),
      })

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error
      setSuccess("Account created! Check your email to verify your account.")
      setTimeout(() => router.push("/dashboard"), 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeTab === "login") {
      handleLogin(e)
    } else {
      handleRegister(e)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <Suspense fallback={null}>
            <LoginScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Updated back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 rounded-lg bg-black/50 backdrop-blur-sm border border-gray-800 text-white hover:bg-black/70 hover:border-cyan-400/50 transition-all group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
        <span className="font-medium">Back to Home</span>
      </Link>

      {/* 3D Text - appears on right side */}
      <div className="absolute right-24 top-1/2 -translate-y-1/2 z-5 pointer-events-none hidden lg:block">
        <div className="text-9xl font-bold text-cyan-400/10 leading-none">
          Welcome
          <br />
          Back
        </div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <div className="bg-black/70 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {activeTab === "login" ? "Login to" : "Join"} <span className="text-cyan-400">AlgoSensei</span>
              </h1>
              <p className="text-gray-400">
                {activeTab === "login"
                  ? "Access your algorithmic trading strategies"
                  : "Start building your trading algorithms today"}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === "login" ? "bg-cyan-400 text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === "register" ? "bg-cyan-400 text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-gray-900/50 border-cyan-400/20 text-white placeholder:text-gray-500 focus:border-cyan-400"
                    required={activeTab === "register"}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-900/50 border-cyan-400/20 text-white placeholder:text-gray-500 focus:border-cyan-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  {activeTab === "login" && (
                    <Link href="#" className="text-sm text-cyan-400 hover:underline">
                      Forgot Password?
                    </Link>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-900/50 border-cyan-400/20 text-white placeholder:text-gray-500 focus:border-cyan-400"
                  required
                />
              </div>

              {activeTab === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-900/50 border-cyan-400/20 text-white placeholder:text-gray-500 focus:border-cyan-400"
                    required={activeTab === "register"}
                  />
                </div>
              )}

              {activeTab === "login" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-cyan-400/20 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400"
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-400 cursor-pointer select-none">
                    Remember me for 30 days
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-semibold py-6 text-lg"
              >
                {isLoading
                  ? activeTab === "login"
                    ? "Logging in..."
                    : "Creating account..."
                  : activeTab === "login"
                    ? "Login"
                    : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
              {activeTab === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
                className="text-cyan-400 hover:underline font-medium"
              >
                {activeTab === "login" ? "Sign up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
