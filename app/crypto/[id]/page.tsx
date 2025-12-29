import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CryptoDetailClient from "@/components/crypto-detail-client"

export default async function CryptoDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/login")
  }

  return <CryptoDetailClient cryptoId={params.id} />
}
