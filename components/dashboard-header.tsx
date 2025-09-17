// components/dashboard-header.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Home, LogOut, Menu, Music } from "lucide-react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { ThemeToggle } from "./theme-toggle" // 1. IMPORTE AQUI

export function DashboardHeader() {
  const router = useRouter()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleSignOut = async () => {
    localStorage.removeItem("casa-nova-auth")
    router.push("/")
    setIsSheetOpen(false)
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Home className="h-8 w-8 text-music-600" />
            <Music className="h-4 w-4 text-music-500 absolute -bottom-1 -right-1" />
          </div>
          <h1 className="text-xl font-bold text-card-foreground">Casa Nova</h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Bem-vindo, Casa Nova!</span>
          <ThemeToggle /> {/* 2. ADICIONE AQUI */}
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden">
           <div className="flex items-center gap-2">
            <ThemeToggle /> {/* 2. ADICIONE AQUI TAMBÉM */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                {/* ... (o conteúdo do menu mobile continua o mesmo) ... */}
              </SheetContent>
            </Sheet>
           </div>
        </div>
      </div>
    </header>
  )
}