"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface OpenInterestData {
  symbol: string
  exchange: string
  btc_oi: number
  oi_usd: number
  rate: number
  change_1h: number
  change_4h: number
  change_24h: number
}

export default function OpenInterestClient({ user, profile }: any) {
  const router = useRouter()
  const [openInterest, setOpenInterest] = useState<OpenInterestData[]>([])
  const [activeSymbol, setActiveSymbol] = useState("BTC")
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const generateOIData = (): OpenInterestData[] => {
      const symbols = ["BTC", "ETH", "SOL", "XRP", "DOGE", "BNB", "ADA", "AVAX", "LINK", "MATIC"]
      const exchanges = ["Binance", "OKX", "Bybit", "dYdX", "CME", "KuCoin", "Gate.io", "Bitget", "MEXC", "Kraken"]

      return symbols.map((symbol, index) => {
        const baseOI = symbol === "BTC" ? 120000 : symbol === "ETH" ? 80000 : 5000 + Math.random() * 15000
        const exchange = exchanges[index]

        return {
          symbol,
          exchange,
          btc_oi: baseOI / 1000,
          oi_usd: (baseOI * (symbol === "BTC" ? 88000 : symbol === "ETH" ? 3300 : 100 + Math.random() * 200)) / 1e9,
          rate: 15 + Math.random() * 10,
          change_1h: -0.5 + Math.random(),
          change_4h: -1 + Math.random() * 2,
          change_24h: -2 + Math.random() * 4,
        }
      })
    }

    setOpenInterest(generateOIData())
    setLoading(false)
  }, [activeSymbol])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const totalOI = openInterest.reduce((sum, item) => sum + item.oi_usd, 0)
  const totalChange =
    openInterest.length > 0 ? openInterest.reduce((sum, item) => sum + item.change_24h, 0) / openInterest.length : 0

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Bar */}
      <div className="bg-[#0a0a0a] border-b border-gray-800 px-6 py-2">
        <div className="flex items-center gap-8 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Total BTC Futures Open Interest</span>
            <span className="text-white font-medium">${totalOI.toFixed(2)}B</span>
            <span className={totalChange >= 0 ? "text-green-500" : "text-red-500"}>
              {totalChange >= 0 ? "+" : ""}
              {totalChange.toFixed(2)}%
            </span>
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
              <Link href="/open-interest" className="px-4 py-2 rounded bg-gray-800 text-white">
                Open Interest
              </Link>
              <Link
                href="/liquidation"
                className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
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
                className="px-4 py-3 rounded bg-gray-800 text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Open Interest
              </Link>
              <Link
                href="/liquidation"
                className="px-4 py-3 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
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

        {/* Open Interest Table */}
        <Card className="bg-[#0d1117] border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/50">
                <tr className="text-left text-xs text-gray-400">
                  <th className="px-6 py-4 font-medium">Ranking</th>
                  <th className="px-6 py-4 font-medium">Symbol</th>
                  <th className="px-6 py-4 font-medium">Exchanges</th>
                  <th className="px-6 py-4 font-medium">OI(BTC)</th>
                  <th className="px-6 py-4 font-medium">OI</th>
                  <th className="px-6 py-4 font-medium">Rate</th>
                  <th className="px-6 py-4 font-medium">OI Change (1h)</th>
                  <th className="px-6 py-4 font-medium">OI Change (4h)</th>
                  <th className="px-6 py-4 font-medium">OI Change (24h)</th>
                  <th className="px-6 py-4 font-medium">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-gray-400">
                      Loading open interest data...
                    </td>
                  </tr>
                ) : (
                  openInterest.map((item, index) => (
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
                      <td className="px-6 py-4 font-mono text-white">{item.btc_oi.toFixed(2)}K BTC</td>
                      <td className="px-6 py-4 font-mono text-white">${item.oi_usd.toFixed(2)}B</td>
                      <td className="px-6 py-4 text-white">{item.rate.toFixed(2)}%</td>
                      <td className="px-6 py-4">
                        <span className={item.change_1h >= 0 ? "text-green-500" : "text-red-500"}>
                          {item.change_1h >= 0 ? "+" : ""}
                          {item.change_1h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={item.change_4h >= 0 ? "text-green-500" : "text-red-500"}>
                          {item.change_4h >= 0 ? "+" : ""}
                          {item.change_4h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={item.change_24h >= 0 ? "text-green-500" : "text-red-500"}>
                          {item.change_24h >= 0 ? "+" : ""}
                          {item.change_24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="px-4 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-sm transition-colors">
                          {item.exchange}
                        </button>
                      </td>
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
