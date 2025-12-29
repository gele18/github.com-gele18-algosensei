"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface LiquidationData {
  symbol: string
  exchange: string
  side: "Long" | "Short"
  size: number
  price: number
  time: string
}

export default function LiquidationClient({ user, profile }: any) {
  const router = useRouter()
  const [liquidations, setLiquidations] = useState<LiquidationData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSymbol, setActiveSymbol] = useState("BTC")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const generateLiquidationData = (): LiquidationData[] => {
      const symbols = ["BTC", "ETH", "SOL", "XRP", "DOGE", "BNB", "ADA", "AVAX", "LINK", "MATIC"]
      const exchanges = ["Binance", "Bybit", "OKX", "dYdX", "KuCoin", "Bitget", "Gate.io", "MEXC", "Kraken", "Huobi"]
      const data: LiquidationData[] = []

      for (let i = 0; i < 10; i++) {
        const symbol = symbols[i % symbols.length]
        const exchange = exchanges[i % exchanges.length]
        const side = Math.random() > 0.5 ? "Long" : "Short"
        const basePrice = symbol === "BTC" ? 88000 : symbol === "ETH" ? 3300 : 50 + Math.random() * 150

        data.push({
          symbol,
          exchange,
          side,
          size: 50000 + Math.random() * 200000,
          price: basePrice * (0.98 + Math.random() * 0.04),
          time: `${Math.floor(Math.random() * 60)} min ago`,
        })
      }

      return data
    }

    setLiquidations(generateLiquidationData())
    setLoading(false)

    // Update liquidations every 30 seconds
    const interval = setInterval(() => {
      setLiquidations(generateLiquidationData())
    }, 30000)

    return () => clearInterval(interval)
  }, [activeSymbol])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const totalLongLiq = liquidations.filter((l) => l.side === "Long").reduce((sum, l) => sum + l.size, 0)
  const totalShortLiq = liquidations.filter((l) => l.side === "Short").reduce((sum, l) => sum + l.size, 0)
  const total24hLiq = (totalLongLiq + totalShortLiq) / 1e6

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Bar */}
      <div className="bg-[#0a0a0a] border-b border-gray-800 px-6 py-2">
        <div className="flex items-center gap-8 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">24h Liquidation</span>
            <span className="text-white font-medium">${total24hLiq.toFixed(2)}M</span>
            <span className="text-red-500">-52.64%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Long Liq</span>
            <span className="text-red-500">${(totalLongLiq / 1e6).toFixed(2)}M</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Short Liq</span>
            <span className="text-green-500">${(totalShortLiq / 1e6).toFixed(2)}M</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold hover:opacity-80 transition-opacity">
              <span className="text-cyan-400">Algo</span>
              <span>Sensei</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-1 text-sm">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Market
              </Link>
              <Link
                href="/exchanges"
                className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Exchanges
              </Link>
              <Link
                href="/open-interest"
                className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Open Interest
              </Link>
              <Link href="/liquidation" className="px-4 py-2 rounded bg-gray-800 text-white">
                Liquidation
              </Link>
              <Link
                href="/profile"
                className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/transactions"
                className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Transactions
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop User Info */}
            <div className="hidden md:flex items-center gap-4">
              {profile?.avatar_url && (
                <img
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border-2 border-cyan-400"
                />
              )}
              <div className="text-sm text-gray-400">{profile?.full_name || user.email}</div>
              <Button
                onClick={handleLogout}
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded-lg"
              >
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-800 bg-black">
            <div className="flex flex-col p-4 space-y-2">
              <Link
                href="/dashboard"
                className="px-4 py-3 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Market
              </Link>
              <Link
                href="/exchanges"
                className="px-4 py-3 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Exchanges
              </Link>
              <Link
                href="/open-interest"
                className="px-4 py-3 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Open Interest
              </Link>
              <Link
                href="/liquidation"
                className="px-4 py-3 rounded bg-gray-800 text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Liquidation
              </Link>
              <Link
                href="/profile"
                className="px-4 py-3 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/transactions"
                className="px-4 py-3 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Transactions
              </Link>
              <div className="border-t border-gray-800 pt-2 mt-2">
                {profile?.avatar_url && (
                  <img
                    src={profile.avatar_url || "/placeholder.svg"}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border-2 border-cyan-400 mb-3"
                  />
                )}
                <div className="text-sm text-gray-400 mb-3">{profile?.full_name || user.email}</div>
                <Button
                  onClick={handleLogout}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded-lg"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="p-6">
        {/* Symbol Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["BTC", "ETH", "SOL", "XRP", "DOGE", "HYPE", "BNB", "ZEC", "BCH", "SUI", "ADA", "LINK", "AVAX"].map(
            (symbol) => (
              <button
                key={symbol}
                onClick={() => setActiveSymbol(symbol)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeSymbol === symbol
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                {symbol}
              </button>
            ),
          )}
        </div>

        {/* Liquidation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-[#0d1117] border-gray-800 p-6">
            <div className="text-sm text-gray-400 mb-2">Total 24h Liquidations</div>
            <div className="text-2xl font-bold text-white">${total24hLiq.toFixed(2)}M</div>
            <div className="text-sm text-red-500">-52.64%</div>
          </Card>
          <Card className="bg-[#0d1117] border-gray-800 p-6">
            <div className="text-sm text-gray-400 mb-2">Long Liquidations</div>
            <div className="text-2xl font-bold text-red-500">${(totalLongLiq / 1e6).toFixed(2)}M</div>
            <div className="text-sm text-gray-400">
              {((totalLongLiq / (totalLongLiq + totalShortLiq)) * 100).toFixed(1)}% of total
            </div>
          </Card>
          <Card className="bg-[#0d1117] border-gray-800 p-6">
            <div className="text-sm text-gray-400 mb-2">Short Liquidations</div>
            <div className="text-2xl font-bold text-green-500">${(totalShortLiq / 1e6).toFixed(2)}M</div>
            <div className="text-sm text-gray-400">
              {((totalShortLiq / (totalLongLiq + totalShortLiq)) * 100).toFixed(1)}% of total
            </div>
          </Card>
        </div>

        {/* Liquidations Table */}
        <Card className="bg-[#0d1117] border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/50">
                <tr className="text-left text-xs text-gray-400">
                  <th className="px-6 py-4 font-medium">Rank</th>
                  <th className="px-6 py-4 font-medium">Symbol</th>
                  <th className="px-6 py-4 font-medium">Exchange</th>
                  <th className="px-6 py-4 font-medium">Side</th>
                  <th className="px-6 py-4 font-medium">Size (USD)</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      Loading liquidation data...
                    </td>
                  </tr>
                ) : (
                  liquidations.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-white">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://www.cryptocompare.com/media/37746251/${item.symbol.toLowerCase()}.png`}
                            alt={item.symbol}
                            className="w-6 h-6 rounded-full bg-gray-800"
                            onError={(e) => {
                              e.currentTarget.src = `https://cryptoicons.org/api/icon/${item.symbol.toLowerCase()}/24`
                            }}
                          />
                          <span className="text-white font-medium">{item.symbol}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white">{item.exchange}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            item.side === "Long" ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"
                          }`}
                        >
                          {item.side}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-white">${item.size.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-white">${item.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-400">{item.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
