import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LiquidationClient from "@/components/liquidation-client"

export default async function LiquidationPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return <LiquidationClient user={data.user} profile={profile} />
}
