"use client"

import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Star, TrendingUp, MessageCircle, ThumbsUp, ArrowLeft } from "lucide-react"

export default function CommunityPage() {
  const reviews = [
    {
      name: "Sarah Chen",
      username: "@sarahtrading",
      avatar: "SC",
      rating: 5,
      profit: "+142.5%",
      date: "2 days ago",
      review:
        "AlgoSensei has completely transformed my trading approach. The scalping strategy alone has given me consistent returns. The AI assistant is incredibly helpful for real-time market analysis.",
      likes: 234,
      comments: 45,
      verified: true,
    },
    {
      name: "Marcus Rodriguez",
      username: "@cryptomarcus",
      avatar: "MR",
      rating: 5,
      profit: "+89.3%",
      date: "5 days ago",
      review:
        "Been using AlgoSensei for 3 months now. The swing trading strategy works perfectly for my schedule. Love the clean interface and real-time data from CoinLore.",
      likes: 189,
      comments: 32,
      verified: true,
    },
    {
      name: "Emily Watson",
      username: "@emilycrypto",
      avatar: "EW",
      rating: 4,
      profit: "+67.8%",
      date: "1 week ago",
      review:
        "Great platform for both beginners and advanced traders. The trend following strategy is easy to understand and implement. Would love to see more educational content.",
      likes: 156,
      comments: 28,
      verified: false,
    },
    {
      name: "David Kim",
      username: "@davidkimtrader",
      avatar: "DK",
      rating: 5,
      profit: "+203.7%",
      date: "1 week ago",
      review:
        "This platform is a game-changer! The combination of automated strategies and manual control is perfect. Customer support is responsive and helpful.",
      likes: 412,
      comments: 67,
      verified: true,
    },
    {
      name: "Lisa Anderson",
      username: "@lisatrading",
      avatar: "LA",
      rating: 4,
      profit: "+45.2%",
      date: "2 weeks ago",
      review:
        "Solid platform with excellent execution speed. The dashboard layout inspired by Coinglass is intuitive. Looking forward to more strategy options.",
      likes: 98,
      comments: 19,
      verified: false,
    },
    {
      name: "James Taylor",
      username: "@jamescrypto",
      avatar: "JT",
      rating: 5,
      profit: "+178.9%",
      date: "2 weeks ago",
      review:
        "AlgoSensei's AI-powered insights have helped me avoid several bad trades. The community is supportive and the strategies are well-documented. Highly recommend!",
      likes: 287,
      comments: 53,
      verified: true,
    },
  ]

  const stats = [
    { label: "Active Traders", value: "12,458" },
    { label: "Total Profit", value: "$24.3M" },
    { label: "Success Rate", value: "87.3%" },
    { label: "Strategies Shared", value: "1,243" },
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
            <span className="text-cyan-400">Community</span> Reviews
          </h1>
          <p className="text-gray-400 text-lg">See what our traders are saying about AlgoSensei</p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/20 p-6 text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map((review, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800 p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
                  {review.avatar}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{review.name}</h3>
                    {review.verified && (
                      <div className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 text-xs">
                        Verified Trader
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>{review.username}</span>
                    <span>•</span>
                    <span>{review.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                    <TrendingUp className="w-4 h-4" />
                    {review.profit}
                  </div>
                </div>
              </div>

              <p className="text-gray-300 mb-4 leading-relaxed">{review.review}</p>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <button className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  {review.likes}
                </button>
                <button className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  {review.comments}
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-8 inline-block">
            <h3 className="text-2xl font-bold text-white mb-2">Join Our Trading Community</h3>
            <p className="text-gray-300 mb-6">Share your strategies and learn from experienced traders</p>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-8">Share Your Review</Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
