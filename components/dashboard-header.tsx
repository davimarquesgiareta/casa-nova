"use client"

import { Button } from "@/components/ui/button"
import { Home, LogOut, Menu, Music } from "lucide-react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { ThemeToggle } from "./theme-toggle"

export function DashboardHeader() {
  const router = useRouter()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleSignOut = async () => {
    localStorage.removeItem("casa-nova-auth")
    router.push("/")
    setIsSheetOpen(false) // Garante que o menu feche ao sair
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
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden">
           <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                {/* MUDANÇA: Adicionamos o conteúdo ao menu mobile */}
                <div className="flex flex-col justify-between h-[calc(100%-2rem)] py-6">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Logado como:</p>
                      <p className="text-sm font-medium">Casa Nova</p>
                    </div>

                    <Button variant="outline" className="w-full justify-center" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair da Conta
                    </Button>
                </div>
              </SheetContent>
            </Sheet>
           </div>
        </div>
      </div>
    </header>
  )
}