"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Show, ShowWithSongs, Song } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Folder, Music, Clock, Edit, Trash2, Eye, GripVertical, X, MessageCircle, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MusicLibraryForShowComponent } from "./music-library-for-show"
import { AddSongToShowMobileComponent } from "./add-song-to-show-mobile"

const setFormData = (data: any) => {
  // Placeholder for setFormData function
}

export function ShowsGrid() {
  const [shows, setShows] = useState<ShowWithSongs[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingShow, setEditingShow] = useState<Show | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedShow, setSelectedShow] = useState<ShowWithSongs | null>(null)
  const [isShowDetailOpen, setIsShowDetailOpen] = useState(false)
  const [dragOverShow, setDragOverShow] = useState<string | null>(null)
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const { toast } = useToast()

  const fetchShows = async () => {
    try {
      const storedShows = localStorage.getItem("casa-nova-shows")
      const storedSongs = localStorage.getItem("casa-nova-songs")
      const storedShowSongs = localStorage.getItem("casa-nova-show-songs")

      const shows: Show[] = storedShows ? JSON.parse(storedShows) : []
      const songs: Song[] = storedSongs ? JSON.parse(storedSongs) : []
      const showSongs: any[] = storedShowSongs ? JSON.parse(storedShowSongs) : []

      const showsWithSongs: ShowWithSongs[] = shows.map((show) => {
        const showSongRelations = showSongs.filter((ss) => ss.show_id === show.id)
        const showSongsWithData = showSongRelations
          .map((ss) => ({
            ...ss,
            song: songs.find((song) => song.id === ss.song_id),
          }))
          .filter((ss) => ss.song)

        const totalSeconds = showSongsWithData.reduce((acc, showSong) => {
          if (showSong.song) {
            return acc + showSong.song.duration_minutes * 60 + showSong.song.duration_seconds
          }
          return acc
        }, 0)

        const totalMinutes = Math.floor(totalSeconds / 60)
        const remainingSeconds = totalSeconds % 60

        return {
          ...show,
          show_songs: showSongsWithData,
          total_duration_minutes: totalMinutes,
          total_duration_seconds: remainingSeconds,
        }
      })

      setShows(showsWithSongs)
    } catch (error) {
      console.error("Erro ao carregar shows:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os shows.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveShows = (newShows: Show[]) => {
    localStorage.setItem("casa-nova-shows", JSON.stringify(newShows))
  }

  const saveShowSongs = (newShowSongs: any[]) => {
    localStorage.setItem("casa-nova-show-songs", JSON.stringify(newShowSongs))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const showData: Show = {
        id: editingShow?.id || Date.now().toString(),
        ...formData,
        created_at: editingShow?.created_at || new Date().toISOString(),
        user_id: "casanova",
      }

      const storedShows = localStorage.getItem("casa-nova-shows")
      const currentShows: Show[] = storedShows ? JSON.parse(storedShows) : []


      let newShows: Show[]
      if (editingShow) {
        newShows = currentShows.map((show) => (show.id === editingShow.id ? showData : show))
        toast({
          title: "Sucesso",
          description: "Show atualizado com sucesso!",
        })
      } else {
        newShows = [showData, ...currentShows]
        toast({
          title: "Sucesso",
          description: "Show criado com sucesso!",
        })
      }

      console.log("novo show", newShows)

      saveShows(newShows)
      setIsDialogOpen(false)
      setEditingShow(null)
      resetForm()
      fetchShows()
    } catch (error) {
      console.error("Erro ao salvar show:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o show.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (show: Show) => {
    setEditingShow(show)
    setFormData({
      name: show.name,
      description: show.description || "",
      city: show.city || "",
      show_date: show.show_date || "",
      show_time: show.show_time || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (showId: string) => {
    if (!confirm("Tem certeza que deseja excluir este show? Todas as músicas associadas serão removidas.")) return

    try {
      const storedShows = localStorage.getItem("casa-nova-shows")
      const storedShowSongs = localStorage.getItem("casa-nova-show-songs")

      const currentShows: Show[] = storedShows ? JSON.parse(storedShows) : []
      const currentShowSongs: any[] = storedShowSongs ? JSON.parse(storedShowSongs) : []

      const newShows = currentShows.filter((show) => show.id !== showId)
      const newShowSongs = currentShowSongs.filter((ss) => ss.show_id !== showId)

      saveShows(newShows)
      saveShowSongs(newShowSongs)

      toast({
        title: "Sucesso",
        description: "Show excluído com sucesso!",
      })
      fetchShows()
    } catch (error) {
      console.error("Erro ao excluir show:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o show.",
        variant: "destructive",
      })
    }
  }

  const handleViewShow = (show: ShowWithSongs) => {
    setSelectedShow(show)
    setIsShowDetailOpen(true)
  }

  const handleDragOver = (e: React.DragEvent, showId: string) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "copy"
    setDragOverShow(showId)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverShow(null)
  }

  const handleDrop = async (e: React.DragEvent, showId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverShow(null)

    try {
      const songData = JSON.parse(e.dataTransfer.getData("application/json")) as Song

      const storedShowSongs = localStorage.getItem("casa-nova-show-songs")
      const currentShowSongs: any[] = storedShowSongs ? JSON.parse(storedShowSongs) : []

      const existingSong = currentShowSongs.find((ss) => ss.show_id === showId && ss.song_id === songData.id)

      if (existingSong) {
        toast({
          title: "Música já adicionada",
          description: "Esta música já está neste show.",
          variant: "destructive",
        })
        return
      }

      const showSongsForShow = currentShowSongs.filter((ss) => ss.show_id === showId)
      const nextPosition = showSongsForShow.length > 0 ? Math.max(...showSongsForShow.map((ss) => ss.position)) + 1 : 1

      const newShowSong = {
        id: Date.now().toString(),
        show_id: showId,
        song_id: songData.id,
        position: nextPosition,
        user_id: "casanova",
        created_at: new Date().toISOString(),
      }

      const newShowSongs = [...currentShowSongs, newShowSong]
      saveShowSongs(newShowSongs)

      toast({
        title: "Sucesso",
        description: `"${songData.name}" foi adicionada ao show!`,
      })

      fetchShows()

      if (selectedShow) {
        const updatedShow = shows.find((show) => show.id === selectedShow.id)
        if (updatedShow) {
          setSelectedShow(updatedShow)
        }
      }
    } catch (error) {
      console.error("Erro ao adicionar música ao show:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a música ao show.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveSongFromShow = async (showSongId: string) => {
    try {
      const storedShowSongs = localStorage.getItem("casa-nova-show-songs")
      const currentShowSongs: any[] = storedShowSongs ? JSON.parse(storedShowSongs) : []

      const newShowSongs = currentShowSongs.filter((ss) => ss.id !== showSongId)
      saveShowSongs(newShowSongs)

      toast({
        title: "Sucesso",
        description: "Música removida do show!",
      })

      await fetchShows()
    } catch (error) {
      console.error("Erro ao remover música do show:", error)
      toast({
        title: "Erro",
        description: "Não foi possível remover a música do show.",
        variant: "destructive",
      })
    }
  }

  const handleAddSongToShow = async (song: Song, showId: string) => {
    try {
      const storedShowSongs = localStorage.getItem("casa-nova-show-songs")
      const currentShowSongs: any[] = storedShowSongs ? JSON.parse(storedShowSongs) : []

      const existingSong = currentShowSongs.find((ss) => ss.show_id === showId && ss.song_id === song.id)

      if (existingSong) {
        toast({
          title: "Música já adicionada",
          description: "Esta música já está neste show.",
          variant: "destructive",
        })
        return
      }

      const showSongsForShow = currentShowSongs.filter((ss) => ss.show_id === showId)
      const nextPosition = showSongsForShow.length > 0 ? Math.max(...showSongsForShow.map((ss) => ss.position)) + 1 : 1

      const newShowSong = {
        id: Date.now().toString(),
        show_id: showId,
        song_id: song.id,
        position: nextPosition,
        user_id: "casanova",
        created_at: new Date().toISOString(),
      }

      const newShowSongs = [...currentShowSongs, newShowSong]
      saveShowSongs(newShowSongs)

      toast({
        title: "Sucesso",
        description: `"${song.name}" foi adicionada ao show!`,
      })

      await fetchShows()
    } catch (error) {
      console.error("Erro ao adicionar música ao show:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a música ao show.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      city: "",
      show_date: "",
      show_time: "",
    })
  }

  const filteredShows = shows.filter((show) => show.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatDuration = (minutes: number, seconds: number) => {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleSendToWhatsApp = () => {
    if (!selectedShow) return

    if (!whatsappNumber.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um número de WhatsApp.",
        variant: "destructive",
      })
      return
    }

    let message = `🎵 *${selectedShow.name}*\n\n`

    if (selectedShow.city) {
      message += `📍 *Cidade:* ${selectedShow.city}\n`
    }

    if (selectedShow.show_date) {
      message += `📅 *Data:* ${new Date(selectedShow.show_date).toLocaleDateString("pt-BR")}\n`
    }

    if (selectedShow.show_time) {
      message += `🕐 *Horário:* ${selectedShow.show_time}\n`
    }

    message += `\n*REPERTÓRIO:*\n\n`

    selectedShow.show_songs.forEach((showSong, index) => {
      if (showSong.song) {
        message += `${index + 1}. ${showSong.song.name} - ${showSong.song.artist}\n`
      }
    })

    if (selectedShow.total_duration_minutes !== undefined && selectedShow.total_duration_seconds !== undefined) {
      message += `\n⏱️ *Duração Total:* ${formatDuration(selectedShow.total_duration_minutes, selectedShow.total_duration_seconds)}`
    }

    const cleanNumber = whatsappNumber.replace(/[\s\-$$$$]/g, "")

    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`

    window.open(whatsappUrl, "_blank")

    setIsWhatsAppModalOpen(false)
    setWhatsappNumber("")

    toast({
      title: "Sucesso",
      description: "Repertório enviado para o WhatsApp!",
    })
  }

  const getShowsStats = () => {
    const totalShows = shows.length
    const showsWithDates = shows.filter((show) => show.show_date).length
    const cities = [...new Set(shows.filter((show) => show.city).map((show) => show.city))].length

    // Músicas mais tocadas
    const songCount: { [key: string]: { count: number; song: Song } } = {}
    shows.forEach((show) => {
      show.show_songs.forEach((showSong) => {
        if (showSong.song) {
          const key = `${showSong.song.name} - ${showSong.song.artist}`
          if (songCount[key]) {
            songCount[key].count++
          } else {
            songCount[key] = { count: 1, song: showSong.song }
          }
        }
      })
    })

    const mostPlayedSongs = Object.entries(songCount)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)

    // Cidades mais tocadas
    const cityCount: { [key: string]: number } = {}
    shows.forEach((show) => {
      if (show.city) {
        cityCount[show.city] = (cityCount[show.city] || 0) + 1
      }
    })

    const mostPlayedCities = Object.entries(cityCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    // Shows por mês
    const showsByMonth: { [key: string]: number } = {}
    shows.forEach((show) => {
      if (show.show_date) {
        const date = new Date(show.show_date)
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
        showsByMonth[monthYear] = (showsByMonth[monthYear] || 0) + 1
      }
    })

    return {
      totalShows,
      showsWithDates,
      cities,
      mostPlayedSongs,
      mostPlayedCities,
      showsByMonth: Object.entries(showsByMonth).sort(([a], [b]) => {
        const [monthA, yearA] = a.split("/").map(Number)
        const [monthB, yearB] = b.split("/").map(Number)
        return yearA - yearB || monthA - monthB
      }),
    }
  }

  const formData = {
    name: "",
    description: "",
    city: "",
    show_date: "",
    show_time: "",
  }

  const [formState, setFormState] = useState(formData)

  useEffect(() => {
    fetchShows()
  }, [])

  useEffect(() => {
    if (selectedShow && shows.length > 0) {
      const updatedShow = shows.find((show) => show.id === selectedShow.id)
      if (updatedShow) {
        setSelectedShow(updatedShow)
      }
    }
  }, [shows])

  if (loading) {
    return <div className="text-center py-8">Carregando shows...</div>
  }

  const stats = getShowsStats()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input placeholder="Buscar shows..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsStatsModalOpen(true)}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Estatísticas
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setFormState(formData)
                  setEditingShow(null)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Show
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingShow ? "Editar Show" : "Criar Novo Show"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Show</Label>
                  <Input
                    id="name"
                    placeholder="Ex: New York Pub, Show Acústico..."
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Ex: São Paulo, Rio de Janeiro..."
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="show_date">Data do Show</Label>
                    <Input
                      id="show_date"
                      type="date"
                      value={formState.show_date}
                      onChange={(e) => setFormState({ ...formState, show_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="show_time">Horário</Label>
                    <Input
                      id="show_time"
                      type="time"
                      value={formState.show_time}
                      onChange={(e) => setFormState({ ...formState, show_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Detalhes sobre o show..."
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingShow ? "Atualizar" : "Criar"} Show
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-muted/50 border border-dashed border-muted-foreground/25 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          🎵 <strong>Dica:</strong> Arraste músicas da "Biblioteca de Músicas" para os shows abaixo para criar seus
          setlists!
        </p>
      </div>

      {filteredShows.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "Nenhum show encontrado" : "Nenhum show criado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Tente buscar por outros termos."
                : "Comece criando seu primeiro show para organizar suas músicas."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Show
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredShows.map((show) => (
            <Card
              key={show.id}
              className={`hover:shadow-md transition-all ${
                dragOverShow === show.id ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, show.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, show.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate flex items-center gap-2">
                      <Folder className="w-5 h-5 text-primary" />
                      {show.name}
                    </CardTitle>
                    {show.description && (
                      <p className="text-sm text-muted-foreground truncate mt-1">{show.description}</p>
                    )}
                    {show.city && <p className="text-sm text-muted-foreground mt-1">📍 {show.city}</p>}
                    {(show.show_date || show.show_time) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {show.show_date && new Date(show.show_date).toLocaleDateString("pt-BR")}
                        {show.show_date && show.show_time && " às "}
                        {show.show_time}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewShow(show)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(show)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(show.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <Music className="w-3 h-3 mr-1" />
                    {show.show_songs.length} músicas
                  </Badge>
                  {show.total_duration_minutes !== undefined && show.total_duration_seconds !== undefined && (
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(show.total_duration_minutes, show.total_duration_seconds)}
                    </Badge>
                  )}
                </div>
                {dragOverShow === show.id && (
                  <div className="mt-3 p-2 border-2 border-dashed border-primary rounded-lg text-center">
                    <p className="text-sm text-primary font-medium">Solte a música aqui!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isShowDetailOpen} onOpenChange={setIsShowDetailOpen}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-primary" />
                  {selectedShow?.name}
                </DialogTitle>
                <div className="text-sm text-muted-foreground space-y-1">
                  {selectedShow?.description && <p>{selectedShow.description}</p>}
                  {selectedShow?.city && <p>📍 {selectedShow.city}</p>}
                  {(selectedShow?.show_date || selectedShow?.show_time) && (
                    <p>
                      {selectedShow.show_date && new Date(selectedShow.show_date).toLocaleDateString("pt-BR")}
                      {selectedShow.show_date && selectedShow.show_time && " às "}
                      {selectedShow.show_time}
                    </p>
                  )}
                </div>
              </div>
              {selectedShow && selectedShow.show_songs.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWhatsAppModalOpen(true)}
                  className="bg-green-600 text-white border-green-600 hover:bg-green-600/90 hover:border-green-600/90"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar Repertório
                </Button>
              )}
            </div>
          </DialogHeader>

          {selectedShow && (
            <div className="flex-1 overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-6 h-full">
                <div className="space-y-4 flex flex-col min-h-0">
                  <div className="flex gap-4 p-4 bg-muted rounded-lg flex-shrink-0">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{selectedShow.show_songs.length}</div>
                      <div className="text-sm text-muted-foreground">Músicas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {selectedShow.total_duration_minutes !== undefined &&
                        selectedShow.total_duration_seconds !== undefined
                          ? formatDuration(selectedShow.total_duration_minutes, selectedShow.total_duration_seconds)
                          : "0:00"}
                      </div>
                      <div className="text-sm text-muted-foreground">Duração Total</div>
                    </div>
                  </div>

                  <div
                    className="space-y-2 flex-1 min-h-0"
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      e.dataTransfer.dropEffect = "copy"
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()

                      try {
                        const songData = JSON.parse(e.dataTransfer.getData("application/json")) as Song
                        handleAddSongToShow(songData, selectedShow.id)
                      } catch (error) {
                        console.error("Erro no drag & drop:", error)
                      }
                    }}
                  >
                    <h4 className="font-semibold">Setlist do Show</h4>
                    <div className="overflow-y-auto flex-1 space-y-2 pr-2">
                      {selectedShow.show_songs.length === 0 ? (
                        <Card
                          className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors"
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            e.currentTarget.classList.add("border-primary", "bg-primary/5")
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            e.currentTarget.classList.remove("border-primary", "bg-primary/5")
                          }}
                        >
                          <CardContent className="text-center py-8">
                            <Music className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">Nenhuma música adicionada ainda.</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Arraste músicas da biblioteca ao lado ou use o botão "Adicionar Música" no mobile.
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        selectedShow.show_songs.map((showSong, index) => (
                          <Card key={showSong.id} className="hover:bg-muted/50">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <h5 className="font-medium">{showSong.song?.name}</h5>
                                    <p className="text-sm text-muted-foreground">{showSong.song?.artist}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{showSong.song?.key}</Badge>
                                  <Badge variant="outline">
                                    {showSong.song &&
                                      formatDuration(showSong.song.duration_minutes, showSong.song.duration_seconds)}
                                  </Badge>
                                  <Badge variant="outline">{showSong.song?.bpm} BPM</Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      handleRemoveSongFromShow(showSong.id)
                                    }}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block space-y-4 min-h-0">
                  <h4 className="font-semibold">Biblioteca de Músicas</h4>
                  <div className="h-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <div className="text-center text-sm text-muted-foreground mb-4">
                      🎵 Arraste as músicas para o setlist ou clique para adicionar
                    </div>
                    <MusicLibraryForShowComponent
                      onAddSong={(song) => handleAddSongToShow(song, selectedShow.id)}
                      showSongs={selectedShow.show_songs.map((ss) => ss.song).filter(Boolean) as Song[]}
                    />
                  </div>
                </div>

                <div className="lg:hidden">
                  <AddSongToShowMobileComponent
                    showId={selectedShow.id}
                    onSongAdded={() => {
                      fetchShows()
                      const updatedShow = shows.find((show) => show.id === selectedShow.id)
                      if (updatedShow) setSelectedShow(updatedShow)
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              Enviar Repertório para WhatsApp
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="whatsapp">Número do WhatsApp</Label>
              <Input
                id="whatsapp"
                placeholder="Ex: 5519989305698"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                type="tel"
              />
              <p className="text-xs text-muted-foreground">
                Digite o número com código do país (55 para Brasil) + DDD + número
              </p>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium mb-2">Prévia da mensagem:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  🎵 <strong>{selectedShow?.name}</strong>
                </p>
                {selectedShow?.city && <p>📍 Cidade: {selectedShow.city}</p>}
                {selectedShow?.show_date && (
                  <p>📅 Data: {new Date(selectedShow.show_date).toLocaleDateString("pt-BR")}</p>
                )}
                {selectedShow?.show_time && <p>🕐 Horário: {selectedShow.show_time}</p>}
                <p>
                  <strong>REPERTÓRIO:</strong>
                </p>
                {selectedShow?.show_songs.slice(0, 3).map((showSong, index) => (
                  <p key={index}>
                    {index + 1}. {showSong.song?.name} - {showSong.song?.artist}
                  </p>
                ))}
                {selectedShow && selectedShow.show_songs.length > 3 && <p>...</p>}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsWhatsAppModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSendToWhatsApp} className="flex-1 bg-green-600 hover:bg-green-600/90 text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Estatísticas dos Shows
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Estatísticas gerais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalShows}</div>
                  <div className="text-sm text-muted-foreground">Total de Shows</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.showsWithDates}</div>
                  <div className="text-sm text-muted-foreground">Shows com Data</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.cities}</div>
                  <div className="text-sm text-muted-foreground">Cidades Diferentes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats.mostPlayedSongs.reduce((acc, [, data]) => acc + data.count, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Músicas Tocadas</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Músicas mais tocadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🎵 Músicas Mais Tocadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.mostPlayedSongs.length > 0 ? (
                    stats.mostPlayedSongs.map(([songKey, data], index) => (
                      <div key={songKey} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{data.song.name}</p>
                            <p className="text-xs text-muted-foreground">{data.song.artist}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{data.count}x</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Nenhuma música tocada ainda</p>
                  )}
                </CardContent>
              </Card>

              {/* Cidades mais tocadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📍 Cidades Mais Tocadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.mostPlayedCities.length > 0 ? (
                    stats.mostPlayedCities.map(([city, count], index) => (
                      <div key={city} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <p className="font-medium">{city}</p>
                        </div>
                        <Badge variant="secondary">
                          {count} show{count > 1 ? "s" : ""}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Nenhuma cidade cadastrada ainda</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Shows por mês */}
            {stats.showsByMonth.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📅 Shows por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {stats.showsByMonth.map(([monthYear, count]) => (
                      <div key={monthYear} className="text-center p-3 bg-muted rounded-lg">
                        <div className="font-bold text-primary">{count}</div>
                        <div className="text-xs text-muted-foreground">{monthYear}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
