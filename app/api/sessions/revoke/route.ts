import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { session_id } = await request.json()

    // Delete the session
    const { error } = await supabase.from("user_sessions").delete().eq("id", session_id).eq("user_id", user.id)

    if (error) throw error

    // Log the activity
    await fetch(`${request.headers.get("origin")}/api/log-activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activity_type: "session_revoked",
        description: "Revoked a device session",
        severity: "warning",
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
