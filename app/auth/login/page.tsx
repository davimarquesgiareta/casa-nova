"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Home, Music } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function Page() {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (usuario === "casanova" && senha === "casanova") {
        // const supabase = createClient()

        // Criar sessão fictícia para o usuário casanova
        // const { error: signInError } = await supabase.auth.signInWithPassword({
        //   email: "casanova@casanova.com",
        //   password: "casanova123",
        // })

        // if (signInError) {
        //   // Se não existe, criar o usuário
        //   const { error: signUpError } = await supabase.auth.signUp({
        //     email: "casanova@casanova.com",
        //     password: "casanova123",
        //     options: {
        //       emailRedirectTo: `${window.location.origin}/dashboard`,
        //     },
        //   })

        //   if (signUpError) {
        //     console.log("[v0] Erro ao criar usuário:", signUpError)
        //   }

        //   // Tentar fazer login novamente
        //   await supabase.auth.signInWithPassword({
        //     email: "casanova@casanova.com",
        //     password: "casanova123",
        //   })
        // }

        // Salva no localStorage que está logado (backup)
        localStorage.setItem("casa-nova-auth", "true")
        router.push("/dashboard")
      } else {
        setError("Usuário ou senha incorretos")
      }
    } catch (error: unknown) {
      console.log("[v0] Erro no login:", error)
      setError("Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-music-50 to-music-100">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="relative">
                <Home className="h-8 w-8 text-music-600" />
                <Music className="h-4 w-4 text-music-500 absolute -bottom-1 -right-1" />
              </div>
              <h1 className="text-2xl font-bold text-music-900">Casa Nova</h1>
            </div>
            <p className="text-sm text-music-600">Organize suas músicas e shows</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Entrar</CardTitle>
              <CardDescription>Digite suas credenciais para acessar o sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="usuario">Usuário</Label>
                    <Input
                      id="usuario"
                      type="text"
                      required
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="senha">Senha</Label>
                    <Input
                      id="senha"
                      type="password"
                      required
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-music-500">
            <p>
              Use: <strong>casanova</strong> / <strong>casanova</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
