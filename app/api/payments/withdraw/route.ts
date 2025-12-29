import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getClientIp } from "@/lib/get-client-ip"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, currency = "USD", payment_method_id, description, ip_address: clientIp } = body

    // Check wallet balance
    const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", user.id).single()

    if (!wallet || Number(wallet.balance_usd) < Number(amount)) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    let ip_address = getClientIp(request)
    if (ip_address === "fetch-required" && clientIp) {
      ip_address = clientIp
      console.log("[v0] Using client-provided IP for withdrawal:", ip_address)
    }

    const user_agent = request.headers.get("user-agent") || "unknown"

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        transaction_type: "withdrawal",
        amount_usd: amount,
        currency,
        status: "completed",
        payment_method_id,
        description: description || `Withdrawal ${amount} ${currency}`,
        ip_address,
        user_agent,
        metadata: {
          simulated: true,
          timestamp: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (txError) throw txError

    // Update wallet balance
    await supabase
      .from("wallets")
      .update({
        balance_usd: Number(wallet.balance_usd) - Number(amount),
      })
      .eq("id", wallet.id)

    // Log high-severity activity for withdrawals
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      activity_type: "withdrawal",
      description: `Withdrew $${amount} ${currency}`,
      ip_address,
      user_agent,
      severity: "warning",
      metadata: { transaction_id: transaction.id, amount, currency },
    })

    return NextResponse.json({ success: true, transaction })
  } catch (error: any) {
    console.error("[v0] Withdrawal error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
