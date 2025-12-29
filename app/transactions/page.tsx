import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import TransactionsClient from "@/components/transactions-client"

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/login")
  }

  // Fetch transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(100)

  return <TransactionsClient user={data.user} transactions={transactions || []} />
}
