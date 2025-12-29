import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getClientIp } from "@/lib/get-client-ip"

export async function POST(request: Request) {
  try {
    console.log("[v0] Transfer request received")

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] Transfer failed: User not authenticated")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[v0] Transfer request body:", JSON.stringify(body, null, 2))

    const { recipient_address, amount, currency = "USD", crypto_symbol, crypto_amount, description, ip_address } = body

    // Get client IP
    const clientIp = ip_address || getClientIp(request)
    console.log("[v0] Client IP for transfer:", clientIp)

    // Validate amount
    if (!amount || amount <= 0) {
      console.log("[v0] Transfer failed: Invalid amount")
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Get sender's wallet
    const { data: senderWallet, error: senderWalletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (senderWalletError || !senderWallet) {
      console.log("[v0] Transfer failed: Sender wallet not found", senderWalletError)
      return NextResponse.json({ error: "Sender wallet not found" }, { status: 404 })
    }

    console.log("[v0] Sender wallet:", senderWallet.wallet_address, "Balance:", senderWallet.balance_usd)

    // Check if sender has sufficient balance
    if (Number.parseFloat(senderWallet.balance_usd) < amount) {
      console.log("[v0] Transfer failed: Insufficient balance")
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Find recipient's wallet by wallet address
    const { data: recipientWallet, error: recipientWalletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("wallet_address", recipient_address)
      .single()

    if (recipientWalletError || !recipientWallet) {
      console.log("[v0] Transfer failed: Recipient wallet not found", recipientWalletError)
      return NextResponse.json({ error: "Recipient wallet address not found" }, { status: 404 })
    }

    console.log("[v0] Recipient wallet:", recipientWallet.wallet_address, "Balance:", recipientWallet.balance_usd)

    // Prevent self-transfer
    if (senderWallet.user_id === recipientWallet.user_id) {
      console.log("[v0] Transfer failed: Cannot transfer to self")
      return NextResponse.json({ error: "Cannot transfer to yourself" }, { status: 400 })
    }

    // Deduct from sender
    const newSenderBalance = Number.parseFloat(senderWallet.balance_usd) - amount
    console.log("[v0] New sender balance will be:", newSenderBalance)

    const { error: updateSenderError } = await supabase
      .from("wallets")
      .update({ balance_usd: newSenderBalance.toFixed(2) })
      .eq("id", senderWallet.id)

    if (updateSenderError) {
      console.error("[v0] Error updating sender balance:", updateSenderError)
      return NextResponse.json({ error: "Failed to update sender balance" }, { status: 500 })
    }

    // Add to recipient
    const newRecipientBalance = Number.parseFloat(recipientWallet.balance_usd) + amount
    console.log("[v0] New recipient balance will be:", newRecipientBalance)

    const { error: updateRecipientError } = await supabase
      .from("wallets")
      .update({ balance_usd: newRecipientBalance.toFixed(2) })
      .eq("id", recipientWallet.id)

    if (updateRecipientError) {
      console.error("[v0] Error updating recipient balance:", updateRecipientError)
      // Rollback sender's balance
      await supabase.from("wallets").update({ balance_usd: senderWallet.balance_usd }).eq("id", senderWallet.id)
      return NextResponse.json({ error: "Failed to update recipient balance" }, { status: 500 })
    }

    // Record transfer in transfers table
    const { error: transferError } = await supabase.from("transfers").insert({
      from_user_id: senderWallet.user_id,
      to_user_id: recipientWallet.user_id,
      from_wallet_id: senderWallet.id,
      to_wallet_id: recipientWallet.id,
      amount,
      currency,
      crypto_symbol: crypto_symbol || null,
      crypto_amount: crypto_amount || null,
      status: "completed",
      description: description || `Transfer to ${recipient_address}`,
      ip_address: clientIp,
    })

    if (transferError) {
      console.error("[v0] Error recording transfer:", transferError)
    }

    // Log activity for sender
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      activity_type: "transfer_sent",
      description: `Sent $${amount} to ${recipient_address}`,
      severity: "medium",
      ip_address: clientIp,
    })

    // Log activity for recipient
    await supabase.from("activity_logs").insert({
      user_id: recipientWallet.user_id,
      activity_type: "transfer_received",
      description: `Received $${amount} from ${senderWallet.wallet_address}`,
      severity: "medium",
      ip_address: clientIp,
    })

    // Record transaction for sender
    await supabase.from("transactions").insert({
      user_id: user.id,
      transaction_type: "transfer_sent",
      amount_usd: amount,
      currency,
      status: "completed",
      description: `Sent to ${recipient_address}`,
      ip_address: clientIp,
    })

    // Record transaction for recipient
    await supabase.from("transactions").insert({
      user_id: recipientWallet.user_id,
      transaction_type: "transfer_received",
      amount_usd: amount,
      currency,
      status: "completed",
      description: `Received from ${senderWallet.wallet_address}`,
      ip_address: clientIp,
    })

    console.log("[v0] Transfer completed successfully!")

    return NextResponse.json({
      success: true,
      message: "Transfer completed successfully",
      new_balance: newSenderBalance.toFixed(2),
    })
  } catch (error: any) {
    console.error("[v0] Transfer error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
