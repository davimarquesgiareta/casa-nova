import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Home, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Home className="h-8 w-8 text-music-600" />
              <Music className="h-4 w-4 text-music-500 absolute -bottom-1 -right-1" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Casa Nova</h1>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/auth/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Organize suas músicas como um profissional
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Casa Nova é o Trello para músicos. Gerencie seu repertório, organize setlists e colabore com sua banda de
            forma simples e intuitiva.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/login">Começar Agora</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Music className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Biblioteca de Músicas</CardTitle>
              <CardDescription>
                Cadastre suas músicas com informações técnicas: BPM, tom, duração e artista.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Organização de Shows</CardTitle>
              <CardDescription>
                Crie pastas para cada show e arraste suas músicas para montar o setlist perfeito.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Home className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Filtros Avançados</CardTitle>
              <CardDescription>
                Filtre por tonalidade, BPM, duração e veja estatísticas do seu repertório.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  )
}
