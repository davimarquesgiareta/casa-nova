"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Song } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Music, Clock, Zap, GripVertical, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MusicLibraryForShowProps {
  onAddSong: (song: Song) => void
  showSongs: Song[]
}

export function MusicLibraryForShowComponent({ onAddSong, showSongs }: MusicLibraryForShowProps) {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [draggedSong, setDraggedSong] = useState<Song | null>(null)
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

  const handleDragStart = (e: React.DragEvent, song: Song) => {
    setDraggedSong(song)
    e.dataTransfer.setData("application/json", JSON.stringify(song))
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleDragEnd = () => {
    setDraggedSong(null)
  }

  const handleAddSong = (song: Song) => {
    onAddSong(song)
  }

  const availableSongs = songs.filter((song) => !showSongs.some((showSong) => showSong.id === song.id))

  const filteredSongs = availableSongs.filter(
    (song) =>
      song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDuration = (minutes: number, seconds: number) => {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (loading) {
    return <div className="text-center py-8">Carregando músicas...</div>
  }

  return (
    <div className="space-y-4 h-full flex flex-col min-h-0">
      {/* Search */}
      <div className="relative flex-shrink-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar músicas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 border border-dashed border-muted-foreground/25 rounded-lg p-3 flex-shrink-0">
        <p className="text-xs text-muted-foreground text-center">
          🎵 Arraste as músicas para o setlist ou clique para adicionar
        </p>
      </div>

      {/* Songs list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
        {filteredSongs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Music className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Nenhuma música encontrada"
                  : availableSongs.length === 0
                    ? "Todas as músicas já estão no show"
                    : "Nenhuma música cadastrada"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSongs.map((song) => (
            <Card
              key={song.id}
              className={`hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:bg-muted/50 ${
                draggedSong?.id === song.id ? "opacity-50 scale-95" : ""
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, song)}
              onDragEnd={handleDragEnd}
              onClick={() => handleAddSong(song)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm truncate">{song.name}</CardTitle>
                    <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                  </div>
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
                    {song.bpm}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
