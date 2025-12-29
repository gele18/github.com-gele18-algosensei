"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TrendingUp, Zap, BarChart3, Target, ArrowLeft } from "lucide-react"

export default function StrategyPage() {
  const strategies = [
    {
      name: "Scalping Strategy",
      description:
        "High-frequency trading executing numerous small trades throughout the day to profit from tiny price movements",
      icon: Zap,
      difficulty: "Advanced",
      timeframe: "1-5 minutes",
      features: [
        "Fast decision-making required",
        "High-speed execution platforms",
        "Strict stop-loss orders",
        "High liquidity cryptocurrencies",
      ],
      color: "cyan",
    },
    {
      name: "Swing Trading",
      description: "Hold positions for days or weeks to capture short to medium-term price swings",
      icon: BarChart3,
      difficulty: "Intermediate",
      timeframe: "Few days to weeks",
      features: [
        "Fibonacci retracement levels",
        "Bollinger Bands analysis",
        "Entry during retracements",
        "Exit during rallies",
      ],
      color: "purple",
    },
    {
      name: "Trend Following",
      description:
        "Capitalize on sustained price movements by taking long positions in uptrends and short in downtrends",
      icon: TrendingUp,
      difficulty: "Beginner",
      timeframe: "Weeks to months",
      features: [
        "Moving averages for direction",
        "RSI for trend confirmation",
        "Works in bull/bear markets",
        "Hold until trend reversal",
      ],
      color: "green",
    },
    {
      name: "Mean Reversion",
      description: "Profit from price returning to average after extreme movements",
      icon: Target,
      difficulty: "Intermediate",
      timeframe: "Hours to days",
      features: [
        "Identify overbought/oversold",
        "Support and resistance levels",
        "Statistical analysis",
        "Counter-trend trading",
      ],
      color: "orange",
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      cyan: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
      purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400",
      green: "from-green-500/10 to-green-500/5 border-green-500/20 text-green-400",
      orange: "from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-400",
    }
    return colors[color as keyof typeof colors]
  }

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
            <span className="text-cyan-400">Trading</span> Strategies
          </h1>
          <p className="text-gray-400 text-lg">
            Proven algorithmic trading strategies for maximizing profits in volatile markets
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {strategies.map((strategy) => {
            const Icon = strategy.icon
            return (
              <Card
                key={strategy.name}
                className={`bg-gradient-to-br ${getColorClasses(strategy.color)} p-6 hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-lg bg-black/30`}>
                    <Icon className={`w-6 h-6 ${getColorClasses(strategy.color)}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{strategy.name}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="px-2 py-1 bg-black/30 rounded text-gray-300">{strategy.difficulty}</span>
                      <span className="text-gray-400">{strategy.timeframe}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{strategy.description}</p>

                <div className="space-y-2 mb-6">
                  {strategy.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                      <div className={`w-1.5 h-1.5 rounded-full ${getColorClasses(strategy.color)}`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full bg-black/50 hover:bg-black/70 text-white border border-gray-700">
                  Learn Strategy
                </Button>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
