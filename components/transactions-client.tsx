"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, TrendingUp, TrendingDown, DollarSign, Menu, X } from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: string
  transaction_type: string
  amount_usd: string
  currency: string
  status: string
  description: string
  ip_address: string
  created_at: string
}

interface TransactionsClientProps {
  user: any
  transactions: Transaction[]
}

export default function TransactionsClient({ user, transactions }: TransactionsClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.transaction_type.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterType === "all" || tx.transaction_type === filterType

    return matchesSearch && matchesFilter
  })

  const totalDeposits = transactions
    .filter((tx) => tx.transaction_type === "deposit" && tx.status === "completed")
    .reduce((sum, tx) => sum + Number.parseFloat(tx.amount_usd), 0)

  const totalWithdrawals = transactions
    .filter((tx) => tx.transaction_type === "withdrawal" && tx.status === "completed")
    .reduce((sum, tx) => sum + Number.parseFloat(tx.amount_usd), 0)

  const totalTrades = transactions.filter((tx) => tx.transaction_type === "trade").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case "withdrawal":
        return <TrendingDown className="w-5 h-5 text-red-500" />
      default:
        return <DollarSign className="w-5 h-5 text-cyan-400" />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-800 hover:border-cyan-400/50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
              <h1 className="text-xl md:text-2xl font-bold">
                <span className="hidden md:inline">Transaction </span>
                <span className="text-cyan-400">History</span>
              </h1>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
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
                className="px-4 py-3 rounded bg-gray-800 text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Transactions
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-green-500">Total Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">${totalDeposits.toFixed(2)}</div>
              <p className="text-sm text-gray-400 mt-1">
                {transactions.filter((tx) => tx.transaction_type === "deposit").length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-red-500">Total Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">${totalWithdrawals.toFixed(2)}</div>
              <p className="text-sm text-gray-400 mt-1">
                {transactions.filter((tx) => tx.transaction_type === "withdrawal").length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-cyan-400">Total Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalTrades}</div>
              <p className="text-sm text-gray-400 mt-1">Trading activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900/50 border-gray-800 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                  className="pl-10 bg-gray-900 border-gray-700"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterType === "all" ? "bg-cyan-400 text-black" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("deposit")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterType === "deposit" ? "bg-cyan-400 text-black" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  Deposits
                </button>
                <button
                  onClick={() => setFilterType("withdrawal")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterType === "withdrawal"
                      ? "bg-cyan-400 text-black"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  Withdrawals
                </button>
                <button
                  onClick={() => setFilterType("trade")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterType === "trade" ? "bg-cyan-400 text-black" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  Trades
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your complete transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No transactions found</p>
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center gap-4 p-4 border border-gray-800 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center">
                      {getTypeIcon(transaction.transaction_type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold capitalize">{transaction.transaction_type}</div>
                      <div className="text-sm text-gray-400">{transaction.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.created_at).toLocaleString()} • IP: {transaction.ip_address}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {transaction.transaction_type === "withdrawal" ? "-" : "+"}$
                        {Number.parseFloat(transaction.amount_usd).toFixed(2)}
                      </div>
                      <Badge variant="outline" className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
