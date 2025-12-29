"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface CryptoDetail {
  id: string
  symbol: string
  name: string
  nameid: string
  rank: number
  price_usd: string
  percent_change_24h: string
  percent_change_1h: string
  percent_change_7d: string
  price_btc: string
  market_cap_usd: string
  volume24: number
  volume24a: number
  csupply: string
  tsupply: string
  msupply: string
}

interface CryptoMarket {
  name: string
  base: string
  quote: string
  price: number
  price_usd: number
  volume: number
  volume_usd: number
  time: number
}

export default function CryptoDetailClient({ cryptoId }: { cryptoId: string }) {
  const router = useRouter()
  const [crypto, setCrypto] = useState<CryptoDetail | null>(null)
  const [markets, setMarkets] = useState<CryptoMarket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCryptoDetail()
  }, [cryptoId])

  const fetchCryptoDetail = async () => {
    try {
      const [cryptoResponse, marketsResponse] = await Promise.all([
        fetch(`https://api.coinlore.net/api/ticker/?id=${cryptoId}`),
        fetch(`https://api.coinlore.net/api/coin/markets/?id=${cryptoId}`),
      ])

      const cryptoData = await cryptoResponse.json()
      const marketsData = await marketsResponse.json()

      setCrypto(cryptoData[0] || null)
      setMarkets(marketsData.slice(0, 10) || [])
    } catch (error) {
      console.error("[v0] Error fetching crypto detail:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-400">Loading cryptocurrency details...</div>
      </div>
    )
  }

  if (!crypto) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">Cryptocurrency not found</div>
          <Link href="/dashboard">
            <Button className="bg-cyan-400 hover:bg-cyan-500 text-black">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <nav className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-cyan-400">Algo</span>Sensei
            </Link>
            <div className="flex gap-6 text-sm">
              <Link href="/dashboard" className="text-cyan-400 font-medium">
                Dashboard
              </Link>
              <Link href="/strategy" className="text-gray-400 hover:text-white transition-colors">
                Strategy
              </Link>
              <Link href="/community" className="text-gray-400 hover:text-white transition-colors">
                Community
              </Link>
              <Link href="/studio" className="text-gray-400 hover:text-white transition-colors">
                Studio
              </Link>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            size="sm"
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
          >
            Logout
          </Button>
        </div>
      </nav>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Crypto Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-bold text-white">{crypto.name}</h1>
              <span className="text-2xl text-gray-500">{crypto.symbol}</span>
              <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-400">Rank #{crypto.rank}</span>
            </div>
            <div className="flex items-baseline gap-4">
              <div className="text-4xl font-bold text-white">
                $
                {Number.parseFloat(crypto.price_usd).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}
              </div>
              <div
                className={`text-xl font-semibold ${
                  Number.parseFloat(crypto.percent_change_24h) >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {Number.parseFloat(crypto.percent_change_24h) >= 0 ? "+" : ""}
                {Number.parseFloat(crypto.percent_change_24h).toFixed(2)}%
              </div>
            </div>
          </div>
          <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold">Add to Wallet</Button>
        </div>

        {/* Price Changes */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="text-gray-400 text-sm mb-1">1h Change</div>
            <div
              className={`text-2xl font-bold ${
                Number.parseFloat(crypto.percent_change_1h) >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {Number.parseFloat(crypto.percent_change_1h) >= 0 ? "+" : ""}
              {Number.parseFloat(crypto.percent_change_1h).toFixed(2)}%
            </div>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="text-gray-400 text-sm mb-1">24h Change</div>
            <div
              className={`text-2xl font-bold ${
                Number.parseFloat(crypto.percent_change_24h) >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {Number.parseFloat(crypto.percent_change_24h) >= 0 ? "+" : ""}
              {Number.parseFloat(crypto.percent_change_24h).toFixed(2)}%
            </div>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="text-gray-400 text-sm mb-1">7d Change</div>
            <div
              className={`text-2xl font-bold ${
                Number.parseFloat(crypto.percent_change_7d) >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {Number.parseFloat(crypto.percent_change_7d) >= 0 ? "+" : ""}
              {Number.parseFloat(crypto.percent_change_7d).toFixed(2)}%
            </div>
          </Card>
        </div>

        {/* Market Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="text-gray-400 text-sm mb-1">Market Cap</div>
            <div className="text-xl font-bold text-white">
              ${(Number.parseFloat(crypto.market_cap_usd) / 1e9).toFixed(2)}B
            </div>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="text-gray-400 text-sm mb-1">24h Volume</div>
            <div className="text-xl font-bold text-white">${(crypto.volume24 / 1e6).toFixed(2)}M</div>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="text-gray-400 text-sm mb-1">Circulating Supply</div>
            <div className="text-xl font-bold text-white">
              {Number.parseFloat(crypto.csupply).toLocaleString()} {crypto.symbol}
            </div>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="text-gray-400 text-sm mb-1">Total Supply</div>
            <div className="text-xl font-bold text-white">
              {crypto.tsupply ? `${Number.parseFloat(crypto.tsupply).toLocaleString()} ${crypto.symbol}` : "N/A"}
            </div>
          </Card>
        </div>

        {/* Price in BTC */}
        <Card className="bg-gray-900 border-gray-800 p-4">
          <div className="text-gray-400 text-sm mb-1">Price in BTC</div>
          <div className="text-2xl font-bold text-white font-mono">{crypto.price_btc} BTC</div>
        </Card>

        {/* Markets */}
        {markets.length > 0 && (
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Top Markets</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/50">
                  <tr className="text-left text-sm text-gray-400">
                    <th className="px-4 py-3 font-medium">Exchange</th>
                    <th className="px-4 py-3 font-medium">Pair</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {markets.map((market, index) => (
                    <tr key={index} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-4 text-white font-medium">{market.name}</td>
                      <td className="px-4 py-4 text-gray-400">
                        {market.base}/{market.quote}
                      </td>
                      <td className="px-4 py-4 text-white font-mono">${market.price_usd.toFixed(2)}</td>
                      <td className="px-4 py-4 text-white font-mono">${(market.volume_usd / 1e6).toFixed(2)}M</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Placeholder Chart */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Price Chart</h2>
          <div className="h-96 flex items-center justify-center bg-black/40 rounded-lg border border-gray-800">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
              <p className="text-gray-500">Advanced charting coming soon</p>
              <p className="text-gray-600 text-sm mt-2">Real-time price charts with technical indicators</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
