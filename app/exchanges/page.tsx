import { Suspense } from "react"
import ExchangesClient from "@/components/exchanges-client"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ExchangesPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExchangesClient />
    </Suspense>
  )
}
