"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { MusicLibrary } from "@/components/music-library"
import { ShowsGrid } from "@/components/shows-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MusicStats } from "@/components/music-stats"
import { ShowStats } from "@/components/show-stats"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("casa-nova-auth")
    if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [router])

  return (
    // MUDANÇA: Removemos a classe "min-h-screen" daqui
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
            <MusicStats />
            <MusicLibrary />
          </TabsContent>

          <TabsContent value="shows" className="mt-0 space-y-6">
            <ShowStats />
            <ShowsGrid />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}