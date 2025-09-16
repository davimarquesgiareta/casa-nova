"use client"
import { useState, useEffect } from "react"
import type { Song } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Music, Clock, Zap, Plus, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AddSongToShowMobileProps {
  showId: string
  onSongAdded: () => void
}

export function AddSongToShowMobileComponent({ showId, onSongAdded }: AddSongToShowMobileProps) {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    try {
      const storedSongs = localStorage.getItem("casa-nova-songs")
      if (storedSongs) {
        setSongs(JSON.parse(storedSongs))
      }
    } catch (error) {
      console.error("Erro ao carregar músicas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as músicas.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddSong = async (song: Song) => {
    try {
      const storedShowSongs = localStorage.getItem("casa-nova-show-songs")
      const currentShowSongs: any[] = storedShowSongs ? JSON.parse(storedShowSongs) : []

      // Check if song is already in the show
      const existingSong = currentShowSongs.find((ss) => ss.show_id === showId && ss.song_id === song.id)

      if (existingSong) {
        toast({
          title: "Música já adicionada",
          description: "Esta música já está neste show.",
          variant: "destructive",
        })
        return
      }

      // Get the next position
      const showSongsForShow = currentShowSongs.filter((ss) => ss.show_id === showId)
      const nextPosition = showSongsForShow.length > 0 ? Math.max(...showSongsForShow.map((ss) => ss.position)) + 1 : 1

      // Add song to show
      const newShowSong = {
        id: Date.now().toString(),
        show_id: showId,
        song_id: song.id,
        position: nextPosition,
        user_id: "casanova",
        created_at: new Date().toISOString(),
      }

      const newShowSongs = [...currentShowSongs, newShowSong]
      localStorage.setItem("casa-nova-show-songs", JSON.stringify(newShowSongs))

      toast({
        title: "Sucesso",
        description: `"${song.name}" foi adicionada ao show!`,
      })

      onSongAdded()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao adicionar música ao show:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a música ao show.",
        variant: "destructive",
      })
    }
  }

  const filteredSongs = songs.filter(
    (song) =>
      song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDuration = (minutes: number, seconds: number) => {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-12">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Música
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar Música ao Show</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar músicas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Songs list */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {loading ? (
              <div className="text-center py-8">Carregando músicas...</div>
            ) : filteredSongs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Music className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "Nenhuma música encontrada" : "Nenhuma música cadastrada"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredSongs.map((song) => (
                <Card
                  key={song.id}
                  className="hover:shadow-md transition-all cursor-pointer hover:bg-muted/50"
                  onClick={() => handleAddSong(song)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm truncate">{song.name}</CardTitle>
                        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        <Music className="w-2 h-2 mr-1" />
                        {song.key}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="w-2 h-2 mr-1" />
                        {formatDuration(song.duration_minutes, song.duration_seconds)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="w-2 h-2 mr-1" />
                        {song.bpm} BPM
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
