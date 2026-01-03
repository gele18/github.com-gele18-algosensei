import { type NextRequest, NextResponse } from "next"

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.COINGECKO_API_KEY

    if (!apiKey) {
      console.error("[v0] CoinGecko API key not found")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Fetch top 100 cryptocurrencies with market data
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`,
      {
        headers: {
          "x-cg-demo-api-key": apiKey,
        },
      },
    )

    if (!response.ok) {
      console.error("[v0] CoinGecko API error:", response.status, response.statusText)
      return NextResponse.json({ error: "Failed to fetch crypto data" }, { status: response.status })
    }

    const data = await response.json()

    // Transform CoinGecko data to match the existing format
    const transformedData = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price_usd: coin.current_price?.toString() || "0",
      percent_change_24h: coin.price_change_percentage_24h?.toString() || "0",
      market_cap_usd: coin.market_cap?.toString() || "0",
      volume24: coin.total_volume?.toString() || "0",
      rank: coin.market_cap_rank?.toString() || "0",
    }))

    // Calculate global stats
    const totalMarketCap = data.reduce((sum: number, coin: any) => sum + (coin.market_cap || 0), 0)
    const totalVolume = data.reduce((sum: number, coin: any) => sum + (coin.total_volume || 0), 0)

    console.log("[v0] Successfully fetched", transformedData.length, "cryptocurrencies from CoinGecko")

    return NextResponse.json({
      data: transformedData,
      global: {
        total_market_cap_usd: totalMarketCap,
        total_volume_24h_usd: totalVolume,
        active_cryptocurrencies: data.length,
      },
    })
  } catch (error) {
    console.error("[v0] Error in crypto market data API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
