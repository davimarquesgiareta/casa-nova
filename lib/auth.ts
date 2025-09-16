import { createClient } from "@/lib/supabase/client"

export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getCasanovaUserId() {
  const supabase = createClient()

  // Buscar o usuário casanova na tabela users
  const { data: users, error } = await supabase.from("users").select("id").eq("username", "casanova").single()

  if (error || !users) {
    console.log("[v0] Erro ao buscar usuário casanova:", error)
    return null
  }

  return users.id
}

export function logout() {
  const supabase = createClient()
  localStorage.removeItem("casa-nova-auth")
  supabase.auth.signOut()
}
