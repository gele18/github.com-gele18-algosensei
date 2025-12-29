"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Blocks, Lightbulb, Rocket, Code, ArrowLeft } from "lucide-react"

export default function StudioPage() {
  const tools = [
    {
      name: "Strategy Builder",
      description: "Visual drag-and-drop interface for creating custom trading algorithms",
      icon: Blocks,
      status: "Active",
      color: "cyan",
    },
    {
      name: "Backtest Engine",
      description: "Test your strategies against historical data to validate performance",
      icon: Lightbulb,
      status: "Active",
      color: "purple",
    },
    {
      name: "Live Deployment",
      description: "Deploy your strategies to trade automatically with real-time execution",
      icon: Rocket,
      status: "Active",
      color: "green",
    },
    {
      name: "Code Editor",
      description: "Advanced Python/JavaScript editor for custom strategy development",
      icon: Code,
      status: "Coming Soon",
      color: "orange",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <Link href="/" className="text-2xl font-bold">
            <span className="text-cyan-400">Algo</span>Sensei
          </Link>
          <div className="w-32" />
        </div>
      </nav>

      <div className="px-6 py-12 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-cyan-400">AlgoBlocks</span> Studio
          </h1>
          <p className="text-gray-400 text-lg">Build, test, and deploy algorithmic trading strategies</p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {tools.map((tool) => {
            const Icon = tool.icon
            const colorClasses = {
              cyan: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20",
              purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
              green: "from-green-500/10 to-green-500/5 border-green-500/20",
              orange: "from-orange-500/10 to-orange-500/5 border-orange-500/20",
            }[tool.color]

            return (
              <Card key={tool.name} className={`bg-gradient-to-br ${colorClasses} p-8`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-black/30">
                    <Icon className={`w-8 h-8 text-${tool.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white">{tool.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tool.status === "Active"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        }`}
                      >
                        {tool.status}
                      </span>
                    </div>
                    <p className="text-gray-300">{tool.description}</p>
                  </div>
                </div>
                <Button
                  disabled={tool.status !== "Active"}
                  className="w-full bg-black/50 hover:bg-black/70 text-white border border-gray-700 disabled:opacity-50"
                >
                  {tool.status === "Active" ? "Launch Tool" : "Coming Soon"}
                </Button>
              </Card>
            )
          })}
        </div>

        {/* Features */}
        <Card className="bg-gray-900 border-gray-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Studio Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Blocks className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">No-Code Interface</h3>
              <p className="text-sm text-gray-400">Build strategies without writing a single line of code</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Real-Time Testing</h3>
              <p className="text-sm text-gray-400">Validate strategies with historical and live data</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">One-Click Deploy</h3>
              <p className="text-sm text-gray-400">Launch your strategies with a single click</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
