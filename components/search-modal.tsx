"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, X, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

interface Cryptocurrency {
  id: string
  symbol: string
  name: string
  rank: number
  price_usd: string
  percent_change_24h: string
  market_cap_usd: string
  volume24: string
}

interface SearchModalProps {
  cryptos: Cryptocurrency[]
  onClose: () => void
}

export default function SearchModal({ cryptos, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null)
  const router = useRouter()

  const filteredCryptos = cryptos
    .filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .slice(0, 20)

  const trending = cryptos
    .slice()
    .sort((a, b) => Number.parseFloat(b.percent_change_24h) - Number.parseFloat(a.percent_change_24h))
    .slice(0, 10)

  const handleSelectCrypto = (crypto: Cryptocurrency) => {
    setSelectedCrypto(crypto)
  }

  const handleNavigate = () => {
    if (selectedCrypto) {
      router.push(`/crypto/${selectedCrypto.id}`)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-start justify-center pt-20">
      <div
        className="w-full max-w-5xl bg-[#0d1117] border border-gray-800 rounded-lg shadow-2xl flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side - Search Results */}
        <div className="flex-1 border-r border-gray-800">
          <div className="p-4 border-b border-gray-800 flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-500" />
            <Input
              autoFocus
              placeholder="Search Token, Dex Pairs, NFT, Exchanges, Categories, Articles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 text-white placeholder:text-gray-500 focus-visible:ring-0 text-lg"
            />
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            <div className="flex gap-4 mb-4 text-sm">
              <button className="px-3 py-1.5 bg-cyan-500 text-black rounded-lg font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending
              </button>
              <button className="px-3 py-1.5 text-gray-400 hover:text-white">NFTs</button>
              <button className="px-3 py-1.5 text-gray-400 hover:text-white">Categories</button>
            </div>

            {searchQuery ? (
              <div className="space-y-1">
                <div className="text-xs text-gray-500 mb-2">Search Results</div>
                {filteredCryptos.map((crypto) => (
                  <button
                    key={crypto.id}
                    onClick={() => handleSelectCrypto(crypto)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/50 transition-colors ${
                      selectedCrypto?.id === crypto.id ? "bg-gray-800" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://cryptoicons.org/api/icon/${crypto.symbol.toLowerCase()}/32`}
                        alt={crypto.symbol}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = "/crypto-digital-landscape.png"
                        }}
                      />
                      <div className="text-left">
                        <div className="font-semibold text-white">{crypto.name}</div>
                        <div className="text-xs text-gray-500">{crypto.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white">${Number.parseFloat(crypto.price_usd).toFixed(4)}</div>
                      <div
                        className={`text-xs ${Number.parseFloat(crypto.percent_change_24h) >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {Number.parseFloat(crypto.percent_change_24h) >= 0 ? "+" : ""}
                        {Number.parseFloat(crypto.percent_change_24h).toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                  <span className="text-orange-500">🔥</span> Trending Search
                </div>
                {trending.map((crypto) => (
                  <button
                    key={crypto.id}
                    onClick={() => handleSelectCrypto(crypto)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/50 transition-colors ${
                      selectedCrypto?.id === crypto.id ? "bg-gray-800" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://cryptoicons.org/api/icon/${crypto.symbol.toLowerCase()}/32`}
                        alt={crypto.symbol}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = "/crypto-digital-landscape.png"
                        }}
                      />
                      <div className="text-left">
                        <div className="font-semibold text-white">{crypto.name}</div>
                        <div className="text-xs text-gray-500">{crypto.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-500">
                        {Number.parseFloat(crypto.percent_change_24h) >= 0 ? "+" : ""}
                        {Number.parseFloat(crypto.percent_change_24h).toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Crypto Details */}
        {selectedCrypto && (
          <div className="w-96 p-6">
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-4">BIFI Stats</div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rank</span>
                  <span className="text-white font-medium">{selectedCrypto.rank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price</span>
                  <span className="text-white font-medium">
                    ${Number.parseFloat(selectedCrypto.price_usd).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">24h%</span>
                  <span
                    className={`font-medium ${Number.parseFloat(selectedCrypto.percent_change_24h) >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {Number.parseFloat(selectedCrypto.percent_change_24h) >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(Number.parseFloat(selectedCrypto.percent_change_24h)).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Market Cap</span>
                  <span className="text-white font-medium">
                    ${(Number.parseFloat(selectedCrypto.market_cap_usd) / 1e6).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">24h Trading Volume</span>
                  <span className="text-white font-medium">
                    ${(Number.parseFloat(selectedCrypto.volume24) / 1e6).toFixed(2)}M
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-3">Last 7 Days</div>
              <div className="h-24 flex items-end gap-1">
                {[45, 52, 48, 65, 58, 75, 82].map((height, i) => (
                  <div key={i} className="flex-1 bg-green-500/30 rounded-t" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>

            <button
              onClick={handleNavigate}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg transition-colors"
            >
              View Details
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
