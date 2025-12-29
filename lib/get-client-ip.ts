/**
 * Comprehensive IP detection utility for Next.js
 * Tries multiple methods to get the real client IP address
 */
export function getClientIp(request: Request): string {
  console.log("[v0] Checking IP from headers...")

  // Try multiple headers in order of reliability
  const headers = [
    "x-vercel-forwarded-for", // Vercel-specific
    "x-forwarded-for", // Standard proxy header
    "cf-connecting-ip", // Cloudflare
    "x-real-ip", // Nginx proxy
    "x-client-ip", // Alternative
    "x-cluster-client-ip", // Rackspace LB
    "forwarded-for",
    "forwarded",
  ]

  for (const header of headers) {
    const value = request.headers.get(header)
    console.log(`[v0] Header ${header}:`, value)
    if (value) {
      // x-forwarded-for can contain multiple IPs, get the first one (client IP)
      const ip = value.split(",")[0].trim()
      // Validate IP format (basic check)
      if (ip && ip !== "unknown" && !ip.startsWith("127.") && !ip.startsWith("::1")) {
        console.log("[v0] Found IP from headers:", ip)
        return ip
      }
    }
  }

  console.log("[v0] No IP found in headers, returning 'fetch-required'")
  // Return a special value indicating we need to fetch from client
  return "fetch-required"
}

/**
 * Fetch real client IP using an external service
 * This should be called from the client-side as a fallback
 */
export async function fetchClientIp(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json")
    const data = await response.json()
    return data.ip || "unknown"
  } catch (error) {
    console.error("[v0] Failed to fetch client IP:", error)
    return "unknown"
  }
}

/**
 * Enhanced geolocation lookup using ipapi.co (free tier: 1000 requests/day)
 */
export async function getIpGeolocation(ip: string): Promise<{
  city: string
  country: string
  location: string
}> {
  // Don't look up local/unknown IPs
  if (
    ip === "unknown" ||
    ip === "fetch-required" ||
    ip.startsWith("127.") ||
    ip.startsWith("::1") ||
    ip.startsWith("192.168.")
  ) {
    return { city: "Unknown", country: "Unknown", location: "Unknown" }
  }

  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "AlgoSensei-SOC/1.0" },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (response.ok) {
      const data = await response.json()
      return {
        city: data.city || "Unknown",
        country: data.country_name || "Unknown",
        location: data.city && data.country_name ? `${data.city}, ${data.country_name}` : "Unknown",
      }
    }
  } catch (error) {
    console.error("[v0] IP geolocation lookup failed:", error)
  }

  return { city: "Unknown", country: "Unknown", location: "Unknown" }
}
