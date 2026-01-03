"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import AIAssistant from "@/components/ai-assistant"
import SearchModal from "@/components/search-modal"
import {
  TrendingUp,
  TrendingDown,
  Search,
  BarChart3,
  Activity,
  LogOut,
  Wallet,
  Plus,
  X,
  Star,
  Copy,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import Footer from "@/components/footer"

interface Cryptocurrency {
  id: string
  symbol: string
  name: string
  rank: number
  price_usd: string
  percent_change_24h: string
  percent_change_1h: string
  percent_change_7d: string
  market_cap_usd: string
  volume24: string
  csupply: string
  tsupply: string
  msupply: string
}

interface GlobalStats {
  coins_count: number
  active_markets: number
  total_mcap: number
  total_volume: number
  btc_d: string
  eth_d: string
  mcap_change: string
  volume_change: string
}

interface DashboardClientProps {
  user: {
    email?: string
    id?: string
  }
  profile: {
    full_name?: string
    avatar_url?: string // Added avatar_url
  } | null
  wallet: {
    balance_usd: string
    wallet_address: string
    id: string
  } | null
}

export default function DashboardClient({ user, profile, wallet }: DashboardClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([])
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [topGainers, setTopGainers] = useState<Cryptocurrency[]>([])
  const [topLosers, setTopLosers] = useState<Cryptocurrency[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAI, setShowAI] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [activeTab, setActiveTab] = useState("change")
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [selectedHolding, setSelectedHolding] = useState<any>(null)
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy")
  const [tradeAmount, setTradeAmount] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [holdings, setHoldings] = useState<any[]>([])
  const [addingToWallet, setAddingToWallet] = useState<string | null>(null)

  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const [showTransferModal, setShowTransferModal] = useState(false)
  const [recipientAddress, setRecipientAddress] = useState("")
  const [transferAmount, setTransferAmount] = useState("")

  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    setShowAI(false)
    fetchCryptoData()
    fetchHoldings()
    loadFavorites()
    const interval = setInterval(fetchCryptoData, 60000)
    return () => clearInterval(interval)
  }, [pathname])

  const fetchCryptoData = async () => {
    try {
      const response = await fetch("/api/crypto/market-data")

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const responseData = await response.json()

      const allCryptos = responseData.data || []
      setCryptos(allCryptos)
      setGlobalStats(responseData.global || null)

      // Calculate top gainers and losers
      const sorted = [...allCryptos].sort((a, b) => {
        return Number.parseFloat(b.percent_change_24h) - Number.parseFloat(a.percent_change_24h)
      })
      setTopGainers(sorted.slice(0, 5))
      setTopLosers(sorted.slice(-5).reverse())

      console.log("[v0] Successfully loaded crypto data")
    } catch (error) {
      console.error("[v0] Error fetching crypto data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadFavorites = () => {
    const saved = localStorage.getItem(`favorites_${user.id}`)
    if (saved) {
      setFavorites(JSON.parse(saved))
    }
  }

  const fetchHoldings = async () => {
    if (!wallet?.id) return
    try {
      const { data, error } = await supabase.from("wallet_holdings").select("*").eq("wallet_id", wallet.id)

      if (error) throw error
      setHoldings(data || [])
    } catch (error) {
      console.error("[v0] Error fetching holdings:", error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    setIsProcessing(true)
    try {
      let realIp = "unknown"
      try {
        // Try ipify.org first
        const ipResponse = await fetch("https://api.ipify.org?format=json")
        const ipData = await ipResponse.json()
        realIp = ipData.ip || "unknown"
        console.log("[v0] Client IP for deposit:", realIp)
      } catch (e) {
        // Fallback to ipapi.co if ipify fails
        try {
          const fallbackResponse = await fetch("https://ipapi.co/json/")
          const fallbackData = await fallbackResponse.json()
          realIp = fallbackData.ip || "unknown"
          console.log("[v0] Client IP from fallback:", realIp)
        } catch (e2) {
          console.error("[v0] All IP services failed:", e, e2)
        }
      }

      const response = await fetch("/api/payments/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(depositAmount),
          currency: "USD",
          description: "Wallet deposit",
          ip_address: realIp,
        }),
      })

      if (!response.ok) throw new Error("Deposit failed")

      alert("Deposit successful!")
      setDepositAmount("")
      setShowDepositModal(false)
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Deposit error:", error)
      alert(error.message || "Failed to process deposit")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    if (Number(withdrawAmount) > Number(wallet?.balance_usd || 0)) {
      alert("Insufficient balance")
      return
    }

    setIsProcessing(true)
    try {
      let realIp = "unknown"
      try {
        // Try ipify.org first
        const ipResponse = await fetch("https://api.ipify.org?format=json")
        const ipData = await ipResponse.json()
        realIp = ipData.ip || "unknown"
        console.log("[v0] Client IP for withdrawal:", realIp)
      } catch (e) {
        // Fallback to ipapi.co if ipify fails
        try {
          const fallbackResponse = await fetch("https://ipapi.co/json/")
          const fallbackData = await fallbackResponse.json()
          realIp = fallbackData.ip || "unknown"
          console.log("[v0] Client IP from fallback:", realIp)
        } catch (e2) {
          console.error("[v0] All IP services failed:", e, e2)
        }
      }

      const response = await fetch("/api/payments/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          currency: "USD",
          description: "Wallet withdrawal",
          ip_address: realIp,
        }),
      })

      if (!response.ok) throw new Error("Withdrawal failed")

      alert("Withdrawal successful!")
      setWithdrawAmount("")
      setShowWithdrawModal(false)
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Withdrawal error:", error)
      alert(error.message || "Failed to process withdrawal")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTransfer = async () => {
    if (!recipientAddress || !recipientAddress.trim()) {
      alert("Please enter a recipient wallet address")
      return
    }

    if (!transferAmount || isNaN(Number(transferAmount)) || Number(transferAmount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    if (Number(transferAmount) > Number(wallet?.balance_usd || 0)) {
      alert("Insufficient balance")
      return
    }

    if (recipientAddress === wallet?.wallet_address) {
      alert("Cannot transfer to your own wallet address")
      return
    }

    setIsProcessing(true)
    try {
      let realIp = "unknown"
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json")
        const ipData = await ipResponse.json()
        realIp = ipData.ip || "unknown"
      } catch (e) {
        try {
          const fallbackResponse = await fetch("https://ipapi.co/json/")
          const fallbackData = await fallbackResponse.json()
          realIp = fallbackData.ip || "unknown"
        } catch (e2) {
          console.error("[v0] All IP services failed:", e, e2)
        }
      }

      const response = await fetch("/api/payments/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_address: recipientAddress,
          amount: Number(transferAmount),
          currency: "USD",
          description: `Transfer to ${recipientAddress}`,
          ip_address: realIp,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Transfer failed")
      }

      alert(`Transfer successful! New balance: $${data.new_balance}`)
      setTransferAmount("")
      setRecipientAddress("")
      setShowTransferModal(false)
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Transfer error:", error)
      alert(error.message || "Failed to process transfer")
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredCryptos = cryptos.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleFavorite = (symbol: string) => {
    const newFavorites = favorites.includes(symbol) ? favorites.filter((f) => f !== symbol) : [...favorites, symbol]
    setFavorites(newFavorites)
    localStorage.setItem(`favorites_${user.id}`, JSON.JSON.stringify(newFavorites))
  }

  const addToWallet = async (crypto: Cryptocurrency) => {
    if (!wallet?.id) return

    setAddingToWallet(crypto.symbol)
    try {
      const { error } = await supabase.from("wallet_holdings").insert({
        wallet_id: wallet.id,
        crypto_symbol: crypto.symbol,
        crypto_name: crypto.name,
        amount: 0,
        purchase_price_usd: Number.parseFloat(crypto.price_usd),
      })

      if (error) throw error
      await fetchHoldings()
    } catch (error: any) {
      console.error("[v0] Error adding to wallet:", error)
      if (error.code !== "23505") {
        // Ignore duplicate errors
        alert("Failed to add to wallet")
      }
    } finally {
      setAddingToWallet(null)
    }
  }

  const handleTrade = async () => {
    if (!wallet?.id || !selectedHolding || !tradeAmount) return

    const amount = Number.parseFloat(tradeAmount)
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    try {
      const currentCrypto = cryptos.find((c) => c.symbol === selectedHolding.crypto_symbol)
      const currentPrice = currentCrypto ? Number.parseFloat(currentCrypto.price_usd) : 0

      if (tradeAction === "buy") {
        // Check if wallet has enough balance
        const cost = amount * currentPrice
        if (cost > Number.parseFloat(wallet.balance_usd)) {
          alert("Insufficient balance")
          return
        }

        // Update holding amount
        const { error: updateError } = await supabase
          .from("wallet_holdings")
          .update({
            amount: Number.parseFloat(selectedHolding.amount) + amount,
          })
          .eq("id", selectedHolding.id)

        if (updateError) throw updateError

        // Update wallet balance
        const { error: walletError } = await supabase
          .from("wallets")
          .update({
            balance_usd: (Number.parseFloat(wallet.balance_usd) - cost).toString(),
          })
          .eq("id", wallet.id)

        if (walletError) throw walletError
      } else {
        // Sell
        if (amount > Number.parseFloat(selectedHolding.amount)) {
          alert("Insufficient holdings")
          return
        }

        const revenue = amount * currentPrice

        // Update holding amount
        const { error: updateError } = await supabase
          .from("wallet_holdings")
          .update({
            amount: Number.parseFloat(selectedHolding.amount) - amount,
          })
          .eq("id", selectedHolding.id)

        if (updateError) throw updateError

        // Update wallet balance
        const { error: walletError } = await supabase
          .from("wallets")
          .update({
            balance_usd: (Number.parseFloat(wallet.balance_usd) + revenue).toString(),
          })
          .eq("id", wallet.id)

        if (walletError) throw walletError
      }

      // Refresh data
      await fetchHoldings()
      setShowTradeModal(false)
      setTradeAmount("")
      alert(`Successfully ${tradeAction === "buy" ? "bought" : "sold"} ${amount} ${selectedHolding.crypto_symbol}`)
    } catch (error) {
      console.error("[v0] Error trading:", error)
      alert("Failed to execute trade")
    }
  }

  const openTradeModal = (holding: any, action: "buy" | "sell") => {
    setSelectedHolding(holding)
    setTradeAction(action)
    setShowTradeModal(true)
  }

  const openInterest = "126.31"
  const liquidation24h = "243.06"

  const avgRSI = 52.97
  const altcoinSeasonIndex = 37
  const longShortRatio = "50.92%/49.08%"

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedCryptos = [...cryptos].sort((a, b) => {
    if (!sortField) return 0

    let aValue: any, bValue: any
    switch (sortField) {
      case "rank":
        aValue = a.rank
        bValue = b.rank
        break
      case "name":
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case "price":
      case "price_usd":
        aValue = Number.parseFloat(a.price_usd)
        bValue = Number.parseFloat(b.price_usd)
        break
      case "24h":
      case "percent_change_24h":
        aValue = Number.parseFloat(a.percent_change_24h)
        bValue = Number.parseFloat(b.percent_change_24h)
        break
      case "7d":
      case "percent_change_7d":
        aValue = Number.parseFloat(a.percent_change_7d)
        bValue = Number.parseFloat(b.percent_change_7d)
        break
      case "marketcap":
      case "market_cap_usd":
        aValue = Number.parseFloat(a.market_cap_usd)
        bValue = Number.parseFloat(b.market_cap_usd)
        break
      case "volume":
      case "volume24":
        aValue = Number.parseFloat(a.volume24)
        bValue = Number.parseFloat(b.volume24)
        break
      default:
        return 0
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }
    return sortDirection === "asc" ? aValue - bValue : bValue - aValue
  })

  const getFilteredCryptos = () => {
    let filtered = [...sortedCryptos]

    if (searchQuery) {
      filtered = filtered.filter(
        (crypto) =>
          crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    switch (activeTab) {
      case "all-time-high":
        // Show cryptos near their ATH (within 20% of highest price in dataset)
        const maxPrices = new Map<string, number>()
        cryptos.forEach((c) => {
          const price = Number.parseFloat(c.price_usd)
          const current = maxPrices.get(c.symbol) || 0
          if (price > current) maxPrices.set(c.symbol, price)
        })
        filtered = filtered.filter((c) => {
          const price = Number.parseFloat(c.price_usd)
          const max = maxPrices.get(c.symbol) || price
          return price / max >= 0.8
        })
        break

      case "watch":
        filtered = filtered.filter((c) => favorites.includes(c.symbol))
        break

      case "portfolio":
        const holdingSymbols = holdings.map((h) => h.crypto_symbol)
        filtered = filtered.filter((c) => holdingSymbols.includes(c.symbol))
        break

      case "solana":
        // Filter Solana ecosystem tokens
        const solanaMemeTokens = ["SOL", "BONK", "WIF", "BOME", "POPCAT", "MYRO"]
        filtered = filtered.filter((c) => solanaMemeTokens.includes(c.symbol))
        break
    }

    return filtered
  }

  const displayCryptos = getFilteredCryptos()

  const getCryptoIcon = (symbol: string) => {
    const symbolLower = symbol.toLowerCase()
    // Use CryptoCompare API for icons (free and reliable)
    return `https://www.cryptocompare.com/media/37746251/${symbolLower}.png`
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 md:px-6 py-4">
          <Link href="/" className="text-xl md:text-2xl font-bold">
            <span className="text-cyan-400">Algo</span>Sensei
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => router.push("/dashboard")}
              className={`text-sm transition-colors ${
                pathname === "/dashboard" ? "text-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Market
            </button>
            <button
              onClick={() => router.push("/exchanges")}
              className={`text-sm transition-colors ${
                pathname === "/exchanges" ? "text-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Exchanges
            </button>
            <button
              onClick={() => router.push("/open-interest")}
              className={`text-sm transition-colors ${
                pathname === "/open-interest" ? "text-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Open Interest
            </button>
            <button
              onClick={() => router.push("/liquidation")}
              className={`text-sm transition-colors ${
                pathname === "/liquidation" ? "text-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Liquidation
            </button>
            <button
              onClick={() => router.push("/profile")}
              className={`text-sm transition-colors ${
                pathname === "/profile" ? "text-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => router.push("/transactions")}
              className={`text-sm transition-colors ${
                pathname === "/transactions" ? "text-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Transactions
            </button>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setShowSearch(true)} className="p-2 hover:bg-gray-800 rounded-lg">
              <Search className="h-5 w-5" />
            </button>
            <button onClick={() => setShowWalletModal(true)} className="p-2 hover:bg-gray-800 rounded-lg">
              <Wallet className="h-5 w-5" />
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2 hover:bg-gray-800 rounded-lg p-2"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center text-black font-bold">
                  {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            <button onClick={handleLogout} className="hidden md:block p-2 hover:bg-gray-800 rounded-lg">
              <LogOut className="h-5 w-5" />
            </button>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className="w-full h-0.5 bg-white rounded" />
                <span className="w-full h-0.5 bg-white rounded" />
                <span className="w-full h-0.5 bg-white rounded" />
              </div>
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm">
            <div className="flex flex-col p-4 space-y-2">
              <button
                onClick={() => {
                  router.push("/dashboard")
                  setShowMobileMenu(false)
                }}
                className={`text-left px-4 py-3 rounded-lg ${pathname === "/dashboard" ? "bg-cyan-400 text-black" : "text-gray-400 hover:bg-gray-800"}`}
              >
                Market
              </button>
              <button
                onClick={() => {
                  router.push("/exchanges")
                  setShowMobileMenu(false)
                }}
                className={`text-left px-4 py-3 rounded-lg ${pathname === "/exchanges" ? "bg-cyan-400 text-black" : "text-gray-400 hover:bg-gray-800"}`}
              >
                Exchanges
              </button>
              <button
                onClick={() => {
                  router.push("/open-interest")
                  setShowMobileMenu(false)
                }}
                className={`text-left px-4 py-3 rounded-lg ${pathname === "/open-interest" ? "bg-cyan-400 text-black" : "text-gray-400 hover:bg-gray-800"}`}
              >
                Open Interest
              </button>
              <button
                onClick={() => {
                  router.push("/liquidation")
                  setShowMobileMenu(false)
                }}
                className={`text-left px-4 py-3 rounded-lg ${pathname === "/liquidation" ? "bg-cyan-400 text-black" : "text-gray-400 hover:bg-gray-800"}`}
              >
                Liquidation
              </button>
              <button
                onClick={() => {
                  router.push("/profile")
                  setShowMobileMenu(false)
                }}
                className={`text-left px-4 py-3 rounded-lg ${pathname === "/profile" ? "bg-cyan-400 text-black" : "text-gray-400 hover:bg-gray-800"}`}
              >
                Profile
              </button>
              <button
                onClick={() => {
                  router.push("/transactions")
                  setShowMobileMenu(false)
                }}
                className={`text-left px-4 py-3 rounded-lg ${pathname === "/transactions" ? "bg-cyan-400 text-black" : "text-gray-400 hover:bg-gray-800"}`}
              >
                Transactions
              </button>
              <button
                onClick={() => {
                  handleLogout()
                  setShowMobileMenu(false)
                }}
                className="text-left px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 flex items-center gap-2"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="px-4 md:px-6 py-6 md:py-8">
        <div className="bg-[#0a0a0a] border-b border-gray-800 px-6 py-2 hidden lg:block">
          <div className="flex items-center gap-8 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">24h Volume</span>
              <span className="text-white font-medium">
                ${globalStats ? (globalStats.total_volume / 1e9).toFixed(2) : "0"}B
              </span>
              <span
                className={
                  globalStats && Number.parseFloat(globalStats.volume_change) >= 0 ? "text-green-500" : "text-red-500"
                }
              >
                {globalStats?.volume_change}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Open Interest</span>
              <span className="text-white font-medium">${openInterest}B</span>
              <span className="text-green-500">+0.43%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">24h Liquidation</span>
              <span className="text-white font-medium">${liquidation24h}M</span>
              <span className="text-red-500">-52.64%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">24h Long/Short</span>
              <span className="text-white font-medium">{longShortRatio}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid - Made responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#0d1117] border-gray-800 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="text-gray-400 text-sm">Open Interest</div>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">{openInterest}B</div>
              <div className="text-green-500 text-sm">+0.43%</div>
            </div>
            {/* Simple sparkline-like visualization */}
            <div className="mt-3 h-12 flex items-end gap-1">
              {[40, 65, 45, 80, 70, 90, 75, 85, 95, 88].map((height, i) => (
                <div key={i} className="flex-1 bg-cyan-500/30 rounded-t" style={{ height: `${height}%` }} />
              ))}
            </div>
          </Card>

          <Card className="bg-[#0d1117] border-gray-800 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="text-gray-400 text-sm">Liquidation</div>
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">{liquidation24h}M</div>
              <div className="text-red-500 text-sm">-52.64%</div>
            </div>
            <div className="mt-3 h-12 flex items-end gap-1">
              {[90, 75, 85, 65, 55, 45, 50, 40, 35, 30].map((height, i) => (
                <div key={i} className="flex-1 bg-red-500/30 rounded-t" style={{ height: `${height}%` }} />
              ))}
            </div>
          </Card>

          <Card className="bg-[#0d1117] border-gray-800 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="text-gray-400 text-sm">AVG RSI</div>
              <Activity className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">{avgRSI}</div>
              <div className="text-gray-400 text-sm">NEUTRAL</div>
            </div>
            {/* RSI gauge */}
            <div className="mt-3 h-3 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full relative">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded"
                style={{ left: `${avgRSI}%` }}
              />
            </div>
          </Card>

          <Card className="bg-[#0d1117] border-gray-800 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="text-gray-400 text-sm">Altcoin Season</div>
              <BarChart3 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">{altcoinSeasonIndex}</div>
              <div className="text-gray-400 text-sm">NEUTRAL</div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-orange-500/30 rounded-full">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${altcoinSeasonIndex}%` }} />
              </div>
            </div>
          </Card>
        </div>

        {/* Gainers & Losers - Made responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Index */}
          <Card className="bg-[#0d1117] border-gray-800 p-4">
            <h3 className="text-sm font-semibold mb-4 text-white">Index</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">BTC Dominance</span>
                <div className="text-right">
                  <span className="text-white font-medium">{globalStats?.btc_d}%</span>
                  <span className="text-green-500 text-xs ml-2">+0.29%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">ETH Dominance</span>
                <div className="text-right">
                  <span className="text-white font-medium">{globalStats?.eth_d}%</span>
                  <span className="text-red-500 text-xs ml-2">-0.12%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Fear & Greed</span>
                <div className="text-right">
                  <span className="text-yellow-500 font-medium">24</span>
                  <span className="text-gray-500 text-xs ml-2">Fear</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Top Gainers */}
          <Card className="bg-[#0d1117] border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Top Gainers</h3>
              <div className="flex gap-1 text-xs">
                <button className="px-2 py-1 bg-gray-800 text-white rounded">5m</button>
                <button className="px-2 py-1 text-gray-500 hover:text-white">30m</button>
                <button className="px-2 py-1 text-gray-500 hover:text-white">4h</button>
              </div>
            </div>
            <div className="space-y-2">
              {topGainers.slice(0, 5).map((crypto, index) => (
                <Link key={crypto.id} href={`/crypto/${crypto.id}`}>
                  <div className="flex items-center justify-between text-sm hover:bg-gray-800/50 p-2 rounded transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{index + 1}</span>
                      <span className="text-white font-medium">{crypto.symbol}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white">${Number.parseFloat(crypto.price_usd).toFixed(4)}</div>
                      <div className="text-green-500 text-xs">
                        +{Number.parseFloat(crypto.percent_change_24h).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Long/Short */}
          <Card className="bg-[#0d1117] border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Long/Short</h3>
              <div className="flex gap-1 text-xs">
                <button className="px-2 py-1 bg-gray-800 text-white rounded">5m</button>
                <button className="px-2 py-1 text-gray-500 hover:text-white">30m</button>
                <button className="px-2 py-1 text-gray-500 hover:text-white">4h</button>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { name: "BTC/USDT", long: 2.3, short: -2.26 },
                { name: "ETH/USDT", long: 2.34, short: -16.7 },
                { name: "SOL/USDT", long: 2.08, short: -19.38 },
              ].map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{item.name}</span>
                    <span className="text-white">{item.long}</span>
                  </div>
                  <div className="text-xs text-gray-500">Long/Short Ratio</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Cryptocurrency Data Analysis */}
        <Card className="bg-[#0d1117] border-gray-800 overflow-hidden">
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl md:text-2xl font-bold">Cryptocurrency Data Analysis</h2>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search cryptocurrencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 focus:border-cyan-400 pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:gap-4 mb-6 border-b border-gray-800 pb-2">
              <button
                onClick={() => setActiveTab("change")}
                className={`pb-2 px-2 md:px-3 text-xs md:text-sm transition-colors whitespace-nowrap ${
                  activeTab === "change" ? "border-b-2 border-cyan-400 text-cyan-400" : "text-gray-400 hover:text-white"
                }`}
              >
                Change
              </button>
              <button
                onClick={() => setActiveTab("all-time-high")}
                className={`pb-2 px-2 md:px-3 text-xs md:text-sm transition-colors whitespace-nowrap ${
                  activeTab === "all-time-high"
                    ? "border-b-2 border-cyan-400 text-cyan-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                All Time High
              </button>
              <button
                onClick={() => setActiveTab("watch")}
                className={`pb-2 px-2 md:px-3 text-xs md:text-sm transition-colors whitespace-nowrap flex items-center gap-1 ${
                  activeTab === "watch" ? "border-b-2 border-cyan-400 text-cyan-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <Star className="w-3 h-3 md:w-4 md:h-4" />
                Watch
              </button>
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`pb-2 px-2 md:px-3 text-xs md:text-sm transition-colors whitespace-nowrap flex items-center gap-1 ${
                  activeTab === "portfolio"
                    ? "border-b-2 border-cyan-400 text-cyan-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
                Portfolio
              </button>
              <button
                onClick={() => setActiveTab("solana")}
                className={`pb-2 px-2 md:px-3 text-xs md:text-sm transition-colors whitespace-nowrap ${
                  activeTab === "solana" ? "border-b-2 border-cyan-400 text-cyan-400" : "text-gray-400 hover:text-white"
                }`}
              >
                Solana meme
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/50">
                  <tr className="text-left text-xs md:text-sm text-gray-400">
                    <th
                      className="px-3 md:px-6 py-4 font-medium cursor-pointer hover:text-white"
                      onClick={() => handleSort("rank")}
                    >
                      # {sortField === "rank" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="px-3 md:px-6 py-4 font-medium cursor-pointer hover:text-white"
                      onClick={() => handleSort("name")}
                    >
                      Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="px-3 md:px-6 py-4 font-medium cursor-pointer hover:text-white text-right"
                      onClick={() => handleSort("price_usd")}
                    >
                      Price {sortField === "price_usd" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="px-3 md:px-6 py-4 font-medium cursor-pointer hover:text-white text-right"
                      onClick={() => handleSort("percent_change_24h")}
                    >
                      24h % {sortField === "percent_change_24h" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="hidden md:table-cell px-6 py-4 font-medium cursor-pointer hover:text-white text-right"
                      onClick={() => handleSort("percent_change_7d")}
                    >
                      7d % {sortField === "percent_change_7d" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="hidden lg:table-cell px-6 py-4 font-medium cursor-pointer hover:text-white text-right"
                      onClick={() => handleSort("market_cap_usd")}
                    >
                      Market Cap {sortField === "market_cap_usd" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-3 md:px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        <div className="flex items-center justify-center gap-2">
                          <Activity className="w-5 h-5 animate-spin" />
                          Loading market data...
                        </div>
                      </td>
                    </tr>
                  ) : displayCryptos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        No cryptocurrencies found
                      </td>
                    </tr>
                  ) : (
                    displayCryptos.map((crypto) => (
                      <tr key={crypto.id} className="hover:bg-gray-800/50 transition-colors group">
                        <td className="px-3 md:px-6 py-4 text-gray-400">{crypto.rank}</td>
                        <td className="px-3 md:px-6 py-4">
                          <Link
                            href={`/crypto/${crypto.id}`}
                            className="flex items-center gap-2 md:gap-3 hover:text-cyan-400 transition-colors"
                          >
                            <img
                              src={getCryptoIcon(crypto.symbol) || "/placeholder.svg"}
                              alt={crypto.symbol}
                              className="w-6 h-6 md:w-8 md:h-8 rounded-full"
                              onError={(e) => {
                                e.currentTarget.src = `/placeholder.svg?height=32&width=32&query=${crypto.symbol}`
                              }}
                            />
                            <div>
                              <div className="font-semibold text-white text-sm md:text-base">{crypto.name}</div>
                              <div className="text-xs text-gray-400">{crypto.symbol}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-3 md:px-6 py-4 text-right font-mono text-white text-sm md:text-base">
                          $
                          {Number.parseFloat(crypto.price_usd).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}
                        </td>
                        <td className="px-3 md:px-6 py-4 text-right">
                          <span
                            className={`flex items-center justify-end gap-1 text-sm md:text-base ${
                              Number.parseFloat(crypto.percent_change_24h) >= 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {Number.parseFloat(crypto.percent_change_24h) >= 0 ? (
                              <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                            ) : (
                              <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                            )}
                            {Math.abs(Number.parseFloat(crypto.percent_change_24h)).toFixed(2)}%
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 text-right">
                          <span
                            className={`${
                              Number.parseFloat(crypto.percent_change_7d) >= 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {Number.parseFloat(crypto.percent_change_7d) >= 0 ? "+" : ""}
                            {Number.parseFloat(crypto.percent_change_7d).toFixed(2)}%
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 text-right text-gray-300">
                          ${(Number.parseFloat(crypto.market_cap_usd) / 1e9).toFixed(2)}B
                        </td>
                        <td className="px-3 md:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => addToWallet(crypto)}
                              disabled={addingToWallet === crypto.symbol}
                              className="p-1.5 md:p-2 rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 transition-colors disabled:opacity-50"
                              title="Add to wallet"
                            >
                              <Plus className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                            <button
                              onClick={() => toggleFavorite(crypto.symbol)}
                              className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                                favorites.includes(crypto.symbol)
                                  ? "bg-yellow-400/20 text-yellow-400"
                                  : "bg-gray-800 text-gray-400 hover:text-yellow-400"
                              }`}
                              title="Add to watchlist"
                            >
                              <Star
                                className={`w-3 h-3 md:w-4 md:h-4 ${favorites.includes(crypto.symbol) ? "fill-current" : ""}`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <Footer />
      </main>

      {showWalletModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1117] border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Portfolio</h2>
              <button onClick={() => setShowWalletModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Balance Card */}
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-lg p-6">
                <div className="text-sm text-gray-400 mb-2">Total Balance</div>
                <div className="text-4xl font-bold mb-4">
                  ${Number.parseFloat(wallet?.balance_usd || "0").toFixed(2)}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium py-2 rounded-lg transition-colors"
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    Transfer
                  </button>
                </div>
              </div>

              {/* Your Wallet Address section */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <div className="text-sm text-gray-400 mb-2">Your Wallet Address</div>
                <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                  <code className="text-cyan-400 font-mono text-sm">{wallet?.wallet_address}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(wallet?.wallet_address || "")
                      alert("Wallet address copied to clipboard!")
                    }}
                    className="text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Share this address to receive funds from other users</p>
              </div>

              {/* Holdings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Holdings</h3>
                <div className="space-y-3">
                  {holdings.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No holdings yet. Start trading to build your portfolio!</p>
                    </div>
                  ) : (
                    holdings.map((holding) => {
                      const currentCrypto = cryptos.find((c) => c.symbol === holding.crypto_symbol)
                      const currentPrice = currentCrypto ? Number.parseFloat(currentCrypto.price_usd) : 0
                      const value = Number.parseFloat(holding.amount) * currentPrice
                      const pnl =
                        value - Number.parseFloat(holding.purchase_price_usd || "0") * Number.parseFloat(holding.amount)
                      const pnlPercent = holding.purchase_price_usd
                        ? ((currentPrice - Number.parseFloat(holding.purchase_price_usd)) /
                            Number.parseFloat(holding.purchase_price_usd)) *
                          100
                        : 0

                      return (
                        <div key={holding.id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={getCryptoIcon(holding.crypto_symbol) || "/placeholder.svg"}
                                alt={holding.crypto_name}
                                className="w-8 h-8"
                              />
                              <div>
                                <div className="font-semibold">{holding.crypto_name}</div>
                                <div className="text-sm text-gray-400">{holding.crypto_symbol}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">${value.toFixed(2)}</div>
                              <div className={`text-sm ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                            <span>Amount: {Number.parseFloat(holding.amount).toFixed(8)}</span>
                            <span>Avg Buy: ${Number.parseFloat(holding.purchase_price_usd || "0").toFixed(2)}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openTradeModal(holding, "buy")}
                              className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 font-medium py-2 rounded-lg transition-colors"
                            >
                              Buy More
                            </button>
                            <button
                              onClick={() => openTradeModal(holding, "sell")}
                              className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium py-2 rounded-lg transition-colors"
                            >
                              Sell
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDepositModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#0d1117] border border-gray-800 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold">Deposit Funds</h3>
              <button onClick={() => setShowDepositModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Amount (USD)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2">
                {[100, 500, 1000, 5000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDepositAmount(amount.toString())}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <button
                onClick={handleDeposit}
                disabled={isProcessing}
                className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Confirm Deposit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#0d1117] border border-gray-800 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold">Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-500">
                Available Balance: ${Number.parseFloat(wallet?.balance_usd || "0").toFixed(2)}
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Amount (USD)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
                  placeholder="0.00"
                />
              </div>
              <button
                onClick={handleWithdraw}
                disabled={isProcessing}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Confirm Withdrawal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trade Modal */}
      {showTradeModal && selectedHolding && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#0d1117] border border-gray-800 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {tradeAction === "buy" ? "Buy" : "Sell"} {selectedHolding.crypto_name}
              </h3>
              <button
                onClick={() => {
                  setShowTradeModal(false)
                  setTradeAmount("")
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                <img
                  src={getCryptoIcon(selectedHolding.crypto_symbol) || "/placeholder.svg"}
                  alt={selectedHolding.crypto_name}
                  className="w-10 h-10"
                />
                <div className="flex-1">
                  <div className="font-semibold text-white">{selectedHolding.crypto_name}</div>
                  <div className="text-sm text-gray-400">{selectedHolding.crypto_symbol}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Current Price</div>
                  <div className="font-semibold text-white">
                    $
                    {Number.parseFloat(
                      cryptos.find((c) => c.symbol === selectedHolding.crypto_symbol)?.price_usd || "0",
                    ).toFixed(2)}
                  </div>
                </div>
              </div>

              {tradeAction === "buy" && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-500">
                  Available Balance: ${Number.parseFloat(wallet?.balance_usd || "0").toFixed(2)}
                </div>
              )}

              {tradeAction === "sell" && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-500">
                  Your Holdings: {Number.parseFloat(selectedHolding.amount).toFixed(8)} {selectedHolding.crypto_symbol}
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Amount ({selectedHolding.crypto_symbol})</label>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
                  placeholder="0.00000000"
                  step="0.00000001"
                />
              </div>

              {tradeAmount && !isNaN(Number.parseFloat(tradeAmount)) && Number.parseFloat(tradeAmount) > 0 && (
                <div className="bg-gray-900/50 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white">
                      {tradeAmount} {selectedHolding.crypto_symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-white">
                      $
                      {Number.parseFloat(
                        cryptos.find((c) => c.symbol === selectedHolding.crypto_symbol)?.price_usd || "0",
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-gray-800">
                    <span className="text-gray-400">Total:</span>
                    <span className={tradeAction === "buy" ? "text-green-500" : "text-red-500"}>
                      {tradeAction === "buy" ? "-" : "+"}$
                      {(
                        Number.parseFloat(tradeAmount) *
                        Number.parseFloat(
                          cryptos.find((c) => c.symbol === selectedHolding.crypto_symbol)?.price_usd || "0",
                        )
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleTrade}
                disabled={isProcessing || !tradeAmount || Number.parseFloat(tradeAmount) <= 0}
                className={`w-full font-medium py-3 rounded-lg transition-colors disabled:opacity-50 ${
                  tradeAction === "buy"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isProcessing ? "Processing..." : tradeAction === "buy" ? "Confirm Buy" : "Confirm Sell"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#0d1117] border border-gray-800 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold">Send Money</h3>
              <button
                onClick={() => {
                  setShowTransferModal(false)
                  setRecipientAddress("")
                  setTransferAmount("")
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-400">
                Available Balance: ${Number.parseFloat(wallet?.balance_usd || "0").toFixed(2)}
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Recipient Wallet Address</label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-sm"
                  placeholder="ALG-xxxxxxxx"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the recipient's wallet address (e.g., ALG-12345678)</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Amount (USD)</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-2">
                {[10, 50, 100, 500].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTransferAmount(amount.toString())}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors text-sm"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <button
                onClick={handleTransfer}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Send Money"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} cryptos={cryptos} />}

      {/* AI Assistant */}
      {showAI && <AIAssistant />}
      {!showAI && (
        <button
          onClick={() => setShowAI(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:shadow-lg hover:shadow-cyan-400/50 transition-all z-40"
        >
          <Activity className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  )
}
