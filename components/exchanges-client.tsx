"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, ArrowUpDown, Menu, X } from "lucide-react"

interface DerivativesExchange {
  ranking: number
  name: string
  icon: string
  volume24h: string
  openInterest: string
  takerFees: string
  makerFees: string
  liquidation24h: string
  oiVolRatio: string
  score: number
  buttonLabel: string
}

const derivativesExchanges: DerivativesExchange[] = [
  {
    ranking: 1,
    name: "Binance",
    icon: "binance",
    volume24h: "$26.20B",
    openInterest: "$24.96B",
    takerFees: "0.05%",
    makerFees: "0.02%",
    liquidation24h: "$29.23M",
    oiVolRatio: "1.0286",
    score: 88,
    buttonLabel: "Binance",
  },
  {
    ranking: 2,
    name: "OKX",
    icon: "okx",
    volume24h: "$12.01B",
    openInterest: "$7.24B",
    takerFees: "0.05%",
    makerFees: "0.02%",
    liquidation24h: "$9.97M",
    oiVolRatio: "0.6043",
    score: 78,
    buttonLabel: "OKX",
  },
  {
    ranking: 3,
    name: "Bybit",
    icon: "bybit",
    volume24h: "$8.35B",
    openInterest: "$12.39B",
    takerFees: "0.06%",
    makerFees: "0.01%",
    liquidation24h: "$17.40M",
    oiVolRatio: "1.4841",
    score: 70,
    buttonLabel: "Bybit",
  },
  {
    ranking: 4,
    name: "KuCoin",
    icon: "kucoin",
    volume24h: "$1.98B",
    openInterest: "$1.67B",
    takerFees: "0.06%",
    makerFees: "0.02%",
    liquidation24h: "-",
    oiVolRatio: "0.842",
    score: 65,
    buttonLabel: "KuCoin",
  },
  {
    ranking: 5,
    name: "Gate",
    icon: "gate",
    volume24h: "$7.32B",
    openInterest: "$12.04B",
    takerFees: "0.05%",
    makerFees: "0.02%",
    liquidation24h: "$6.63M",
    oiVolRatio: "1.6445",
    score: 65,
    buttonLabel: "Gate",
  },
  {
    ranking: 6,
    name: "WhiteBIT",
    icon: "whitebit",
    volume24h: "$5.20B",
    openInterest: "$6.67B",
    takerFees: "0.035%",
    makerFees: "0.01%",
    liquidation24h: "-",
    oiVolRatio: "0.8981",
    score: 65,
    buttonLabel: "WhiteBIT",
  },
  {
    ranking: 7,
    name: "Bitget",
    icon: "bitget",
    volume24h: "$6.22B",
    openInterest: "$7.08B",
    takerFees: "0.06%",
    makerFees: "0.02%",
    liquidation24h: "-",
    oiVolRatio: "1.6782",
    score: 65,
    buttonLabel: "Bitget",
  },
  {
    ranking: 8,
    name: "BingX",
    icon: "bingx",
    volume24h: "$6.92B",
    openInterest: "$3.23B",
    takerFees: "0.05%",
    makerFees: "0.02%",
    liquidation24h: "-",
    oiVolRatio: "0.4665",
    score: 60,
    buttonLabel: "BingX",
  },
  {
    ranking: 9,
    name: "MEXC",
    icon: "mexc",
    volume24h: "$17.60B",
    openInterest: "$8.62B",
    takerFees: "0.06%",
    makerFees: "0.01%",
    liquidation24h: "-",
    oiVolRatio: "0.4899",
    score: 60,
    buttonLabel: "MEXC",
  },
  {
    ranking: 10,
    name: "Bitunix",
    icon: "bitunix",
    volume24h: "$1.90B",
    openInterest: "$1.72B",
    takerFees: "0.06%",
    makerFees: "0.02%",
    liquidation24h: "-",
    oiVolRatio: "0.906",
    score: 60,
    buttonLabel: "Bitunix",
  },
  {
    ranking: 11,
    name: "Hyperliquid",
    icon: "hyperliquid",
    volume24h: "$2.15B",
    openInterest: "$7.33B",
    takerFees: "0.045%",
    makerFees: "0.01%",
    liquidation24h: "$15.48M",
    oiVolRatio: "3.4109",
    score: 60,
    buttonLabel: "Hyperliquid",
  },
  {
    ranking: 12,
    name: "LBank",
    icon: "lbank",
    volume24h: "$6.81B",
    openInterest: "$2.59B",
    takerFees: "0.06%",
    makerFees: "0.02%",
    liquidation24h: "-",
    oiVolRatio: "0.4452",
    score: 60,
    buttonLabel: "LBank",
  },
  {
    ranking: 13,
    name: "Crypto.com",
    icon: "crypto-com",
    volume24h: "$541.67M",
    openInterest: "$2.03B",
    takerFees: "0.06%",
    makerFees: "0.02%",
    liquidation24h: "-",
    oiVolRatio: "3.7549",
    score: 60,
    buttonLabel: "Crypto.com",
  },
  {
    ranking: 14,
    name: "dYdX",
    icon: "dydx",
    volume24h: "$156.08M",
    openInterest: "$84.03M",
    takerFees: "0.05%",
    makerFees: "-0.02%",
    liquidation24h: "-",
    oiVolRatio: "0.5454",
    score: 60,
    buttonLabel: "dYdX",
  },
  {
    ranking: 15,
    name: "Coinbase",
    icon: "coinbase",
    volume24h: "$2.11B",
    openInterest: "$354.18M",
    takerFees: "0.06%",
    makerFees: "0.02%",
    liquidation24h: "-",
    oiVolRatio: "0.1681",
    score: 60,
    buttonLabel: "Coinbase",
  },
  {
    ranking: 16,
    name: "Deribit",
    icon: "deribit",
    volume24h: "$383.79M",
    openInterest: "$3.29B",
    takerFees: "0.05%",
    makerFees: "0%",
    liquidation24h: "-",
    oiVolRatio: "5.6362",
    score: 60,
    buttonLabel: "Deribit",
  },
  {
    ranking: 17,
    name: "Bitfinex",
    icon: "bitfinex",
    volume24h: "$39.10M",
    openInterest: "$781.30M",
    takerFees: "0.075%",
    makerFees: "-0.02%",
    liquidation24h: "-",
    oiVolRatio: "19.9862",
    score: 60,
    buttonLabel: "Bitfinex",
  },
  {
    ranking: 18,
    name: "CoinEx",
    icon: "coinex",
    volume24h: "$638.56M",
    openInterest: "$310.76M",
    takerFees: "0.05%",
    makerFees: "0.03%",
    liquidation24h: "$536.46K",
    oiVolRatio: "0.4866",
    score: 60,
    buttonLabel: "CoinEx",
  },
  {
    ranking: 19,
    name: "HTX",
    icon: "htx",
    volume24h: "$743.14M",
    openInterest: "$6.75B",
    takerFees: "0.06%",
    makerFees: "0.02%",
    liquidation24h: "$2.93M",
    oiVolRatio: "9.0827",
    score: 60,
    buttonLabel: "HTX",
  },
  {
    ranking: 20,
    name: "Kraken",
    icon: "kraken",
    volume24h: "$298.34M",
    openInterest: "$402.63M",
    takerFees: "0.05%",
    makerFees: "0.02%",
    liquidation24h: "-",
    oiVolRatio: "1.3496",
    score: 60,
    buttonLabel: "Kraken",
  },
  {
    ranking: 21,
    name: "BitMEX",
    icon: "bitmex",
    volume24h: "$183.16M",
    openInterest: "$341.36M",
    takerFees: "0.075%",
    makerFees: "0.02%",
    liquidation24h: "-",
    oiVolRatio: "1.8638",
    score: 60,
    buttonLabel: "BitMEX",
  },
]

export default function ExchangesClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<keyof DerivativesExchange>("volume24h")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [activeTab, setActiveTab] = useState<"exchanges" | "disc">("exchanges")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const filteredExchanges = derivativesExchanges
    .filter((exchange) => exchange.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortField === "volume24h" || sortField === "openInterest") {
        const parseValue = (val: string) => {
          if (val === "-") return 0
          const multiplier = val.includes("B") ? 1e9 : val.includes("M") ? 1e6 : val.includes("K") ? 1e3 : 1
          return Number.parseFloat(val.replace(/[$BMK]/g, "")) * multiplier
        }
        const aVal = parseValue(a[sortField])
        const bVal = parseValue(b[sortField])
        return sortDirection === "desc" ? bVal - aVal : aVal - bVal
      }

      if (sortField === "score" || sortField === "ranking") {
        return sortDirection === "desc" ? b[sortField] - a[sortField] : a[sortField] - b[sortField]
      }

      return 0
    })

  const handleSort = (field: keyof DerivativesExchange) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getCryptoIcon = (iconName: string) => {
    const iconMap: Record<string, string> = {
      binance: "BNB",
      okx: "OKB",
      bybit: "BIT",
      kucoin: "KCS",
      gate: "GT",
      whitebit: "WBT",
      bitget: "BGB",
      bingx: "BGB",
      mexc: "MX",
      bitunix: "BTC",
      hyperliquid: "HYPE",
      lbank: "LBK",
      "crypto-com": "CRO",
      dydx: "DYDX",
      coinbase: "BTC",
      deribit: "BTC",
      bitfinex: "LEO",
      coinex: "CET",
      htx: "HT",
      kraken: "BTC",
      bitmex: "XBT",
    }
    const symbol = iconMap[iconName] || "BTC"
    return `https://www.cryptocompare.com/media/37746251/${symbol.toLowerCase()}.png`
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 md:px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden md:inline">Back to Dashboard</span>
          </Link>
          <Link href="/" className="text-xl md:text-2xl font-bold">
            <span className="text-cyan-400">Algo</span>Sensei
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="hidden md:block w-32" />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-black">
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
                className="px-4 py-3 rounded bg-gray-800 text-white"
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
            </div>
          </div>
        )}
      </nav>

      <div className="px-4 md:px-6 py-6 md:py-12 max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Top Cryptocurrency Derivatives Exchanges Ranked</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === "exchanges" ? "default" : "outline"}
              onClick={() => setActiveTab("exchanges")}
              className={
                activeTab === "exchanges" ? "bg-gray-700 text-white" : "bg-transparent border-gray-700 text-gray-400"
              }
            >
              Exchanges
            </Button>
            <Button
              variant={activeTab === "disc" ? "default" : "outline"}
              onClick={() => setActiveTab("disc")}
              className={
                activeTab === "disc" ? "bg-gray-700 text-white" : "bg-transparent border-gray-700 text-gray-400"
              }
            >
              Exchanges (disc)
            </Button>
          </div>
        </div>

        {/* Exchanges Table */}
        <Card className="bg-[#0d1117] border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/50">
                <tr className="text-left text-xs text-gray-400 border-b border-gray-800">
                  <th
                    className="px-4 py-3 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort("ranking")}
                  >
                    <div className="flex items-center gap-1">
                      Ranking
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 font-medium">Exchanges</th>
                  <th
                    className="px-4 py-3 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort("volume24h")}
                  >
                    <div className="flex items-center gap-1">
                      Volume (24h)
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort("openInterest")}
                  >
                    <div className="flex items-center gap-1">
                      Open Interest
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 font-medium">Taker Fees</th>
                  <th className="px-4 py-3 font-medium">Maker Fees</th>
                  <th className="px-4 py-3 font-medium">Liquidation (24h)</th>
                  <th className="px-4 py-3 font-medium">OI/24h_Vol</th>
                  <th
                    className="px-4 py-3 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort("score")}
                  >
                    <div className="flex items-center gap-1">
                      Score
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 font-medium">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredExchanges.map((exchange) => (
                  <tr key={exchange.ranking} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-4 text-gray-300">{exchange.ranking}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getCryptoIcon(exchange.icon) || "/placeholder.svg"}
                          alt={exchange.name}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/24/1e293b/ffffff?text=${exchange.name.charAt(0)}`
                          }}
                        />
                        <span className="font-medium text-cyan-400">{exchange.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-white font-medium">{exchange.volume24h}</td>
                    <td className="px-4 py-4 text-white">{exchange.openInterest}</td>
                    <td className="px-4 py-4 text-gray-300">{exchange.takerFees}</td>
                    <td className="px-4 py-4 text-gray-300">
                      <span className={exchange.makerFees.includes("-") ? "text-green-400" : "text-gray-300"}>
                        {exchange.makerFees}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-300">{exchange.liquidation24h}</td>
                    <td className="px-4 py-4 text-gray-300">{exchange.oiVolRatio}</td>
                    <td className="px-4 py-4 text-white font-medium">{exchange.score}</td>
                    <td className="px-4 py-4">
                      <Button size="sm" className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1">
                        {exchange.buttonLabel}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
