import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getClientIp } from "@/lib/get-client-ip"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { email, reason } = body

    const ip_address = getClientIp(request)
    const user_agent = request.headers.get("user-agent") || "unknown"

    // Log failed login attempt (no auth required since login failed)
    const { error } = await supabase.from("failed_login_attempts").insert({
      email,
      ip_address,
      user_agent,
      reason,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Failed login log error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
