"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { MusicLibrary } from "@/components/music-library"
import { ShowsGrid } from "@/components/shows-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MusicStats } from "@/components/music-stats"
import { ShowStats } from "@/components/show-stats"

export default function DashboardPage() {
  const router = useRouter()
  
  // 1. Criamos o estado que servirá de "gatilho" para a atualização
  const [statsRefetchTrigger, setStatsRefetchTrigger] = useState(0);

  // 2. Esta função irá atualizar o gatilho, forçando a atualização das estatísticas
  const handleDataChange = () => {
    setStatsRefetchTrigger(prev => prev + 1); // Apenas incrementa o número
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("casa-nova-auth")
    if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [router])

  return (
    <div className="bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
            <TabsTrigger value="library" className="text-sm sm:text-base">
              <span className="hidden sm:inline">Biblioteca de Músicas</span>
              <span className="sm:hidden">Músicas</span>
            </TabsTrigger>
            <TabsTrigger value="shows" className="text-sm sm:text-base">
              <span className="hidden sm:inline">Meus Shows</span>
              <span className="sm:hidden">Shows</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-0 space-y-6">
            {/* 3. Passamos o gatilho e a função de aviso como props */}
            <MusicStats refetchTrigger={statsRefetchTrigger} />
            <MusicLibrary onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="shows" className="mt-0 space-y-6">
            {/* 3. Passamos o gatilho e a função de aviso como props */}
            <ShowStats refetchTrigger={statsRefetchTrigger} />
            <ShowsGrid onDataChange={handleDataChange} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}