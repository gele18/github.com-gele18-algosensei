import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getClientIp, getIpGeolocation } from "@/lib/get-client-ip"

// Helper to parse user agent
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase()

  // Detect browser
  let browser = "Unknown"
  if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome"
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari"
  else if (ua.includes("firefox")) browser = "Firefox"
  else if (ua.includes("edg")) browser = "Edge"
  else if (ua.includes("opera") || ua.includes("opr")) browser = "Opera"

  // Detect OS
  let os = "Unknown"
  if (ua.includes("windows")) os = "Windows"
  else if (ua.includes("mac")) os = "macOS"
  else if (ua.includes("linux")) os = "Linux"
  else if (ua.includes("android")) os = "Android"
  else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) os = "iOS"

  // Detect device type
  let deviceType = "desktop"
  if (ua.includes("mobile")) deviceType = "mobile"
  else if (ua.includes("tablet") || ua.includes("ipad")) deviceType = "tablet"

  return { browser, os, deviceType }
}

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
    const clientProvidedIp = body.ip_address

    let ip_address = getClientIp(request)
    console.log("[v0] Server-detected IP:", ip_address)

    // If server couldn't detect IP, use client-provided IP
    if (ip_address === "fetch-required" && clientProvidedIp) {
      ip_address = clientProvidedIp
      console.log("[v0] Using client-provided IP:", ip_address)
    }

    const { location } = await getIpGeolocation(ip_address)
    console.log("[v0] Geolocation:", location)

    const user_agent = request.headers.get("user-agent") || "unknown"
    const { browser, os, deviceType } = parseUserAgent(user_agent)

    // Mark all other sessions as not current
    await supabase.from("user_sessions").update({ is_current: false }).eq("user_id", user.id)

    // Create new session with real IP and location
    const { data, error } = await supabase
      .from("user_sessions")
      .insert({
        user_id: user.id,
        ip_address,
        user_agent,
        device_type: deviceType,
        browser,
        os,
        location,
        is_current: true,
        last_active_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    console.log("[v0] Session created:", data)

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] Error creating session:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
