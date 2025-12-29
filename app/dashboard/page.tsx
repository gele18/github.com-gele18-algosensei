import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "@/components/dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/login")
  }

  // Fetch user profile and wallet
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", data.user.id).single()

  return <DashboardClient user={data.user} profile={profile} wallet={wallet} />
}
