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
    const { activity_type, description, severity = "info", metadata = {}, ip_address: clientIp } = body

    let ip_address = getClientIp(request)
    console.log("[v0] Server-detected IP:", ip_address)

    // If server couldn't detect IP, use client-provided IP
    if (ip_address === "fetch-required" && clientIp) {
      ip_address = clientIp
      console.log("[v0] Using client-provided IP:", ip_address)
    }

    const user_agent = request.headers.get("user-agent") || "unknown"

    const { data, error } = await supabase
      .from("activity_logs")
      .insert({
        user_id: user.id,
        activity_type,
        description,
        ip_address,
        user_agent,
        severity,
        metadata,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] Activity log error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
