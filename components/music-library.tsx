"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Song } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus, Music, Clock, Zap, Edit, Trash2, GripVertical, Filter, BarChart3, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { StatsCard } from "@/components/stats-card"
import { createClient } from "@/lib/supabase/client"
import { getCasanovaUserId } from "@/lib/auth"

interface Filters {
  search: string
  key: string
  bpmRange: [number, number]
  durationRange: [number, number]
}

export function MusicLibrary() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [draggedSong, setDraggedSong] = useState<Song | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [isFiltersSheetOpen, setIsFiltersSheetOpen] = useState(false)
  const [isStatsSheetOpen, setIsStatsSheetOpen] = useState(false)
  const { toast } = useToast()

  const [filters, setFilters] = useState<Filters>({
    search: "",
    key: "all",
    bpmRange: [60, 200],
    durationRange: [1, 10],
  })

  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    key: "",
    duration_minutes: 0,
    duration_seconds: 0,
    bpm: 0,
  })

  useEffect(() => {
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    try {
      const supabase = createClient()
      const userId = await getCasanovaUserId()

      if (!userId) {
        console.log("[v0] Usuário casanova não encontrado")
        setLoading(false)
        return
      }

      const { data: songsData, error } = await supabase
        .from("songs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.log("[v0] Erro ao buscar músicas:", error)
        // Fallback para localStorage se houver erro
        const storedSongs = localStorage.getItem("casa-nova-songs")
        if (storedSongs) {
          setSongs(JSON.parse(storedSongs))
        }
      } else {
        // Converter duração de segundos para minutos/segundos
        const formattedSongs = songsData.map((song) => ({
          ...song,
          duration_minutes: Math.floor(song.duration / 60),
          duration_seconds: song.duration % 60,
        }))
        setSongs(formattedSongs)
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

  const saveSongs = async (songData: Song, isEdit = false) => {
    const supabase = createClient()
    const userId = await getCasanovaUserId()

    if (!userId) {
      console.log("[v0] Usuário casanova não encontrado")
      return
    }

    // Converter duração para segundos
    const durationInSeconds = songData.duration_minutes * 60 + songData.duration_seconds

    const dbSong = {
      name: songData.name,
      artist: songData.artist,
      key: songData.key,
      duration: durationInSeconds,
      bpm: songData.bpm,
      user_id: userId,
    }

    if (isEdit) {
      const { error } = await supabase.from("songs").update(dbSong).eq("id", songData.id)

      if (error) {
        console.log("[v0] Erro ao atualizar música:", error)
        throw error
      }
    } else {
      const { error } = await supabase.from("songs").insert([dbSong])

      if (error) {
        console.log("[v0] Erro ao inserir música:", error)
        throw error
      }
    }

    // Recarregar lista
    await fetchSongs()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const songData: Song = {
        id: editingSong?.id || Date.now().toString(),
        ...formData,
        created_at: editingSong?.created_at || new Date().toISOString(),
        user_id: "casanova",
      }

      console.log("Criar nova música", songData)

      await saveSongs(songData, !!editingSong)

      toast({
        title: "Sucesso",
        description: editingSong ? "Música atualizada com sucesso!" : "Música adicionada com sucesso!",
      })

      setIsDialogOpen(false)
      setEditingSong(null)
      resetForm()
    } catch (error) {
      console.error("Erro ao salvar música:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar a música.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (song: Song) => {
    setEditingSong(song)
    setFormData({
      name: song.name,
      artist: song.artist,
      key: song.key,
      duration_minutes: song.duration_minutes,
      duration_seconds: song.duration_seconds,
      bpm: song.bpm,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (songId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta música?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("songs").delete().eq("id", songId)

      if (error) {
        console.log("[v0] Erro ao deletar música:", error)
        throw error
      }

      // Recarregar lista
      await fetchSongs()

      toast({
        title: "Sucesso",
        description: "Música excluída com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao excluir música:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a música.",
        variant: "destructive",
      })
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

  const resetForm = () => {
    setFormData({
      name: "",
      artist: "",
      key: "",
      duration_minutes: 0,
      duration_seconds: 0,
      bpm: 0,
    })
  }

  const resetFilters = () => {
    setFilters({
      search: "",
      key: "all",
      bpmRange: [60, 200],
      durationRange: [1, 10],
    })
  }

  const filteredSongs = songs.filter((song) => {
    const matchesSearch =
      song.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      song.artist.toLowerCase().includes(filters.search.toLowerCase())

    const matchesKey = filters.key === "all" || song.key.toLowerCase() === filters.key.toLowerCase()

    const matchesBpm = song.bpm >= filters.bpmRange[0] && song.bpm <= filters.bpmRange[1]

    const songDurationMinutes = song.duration_minutes + song.duration_seconds / 60
    const matchesDuration =
      songDurationMinutes >= filters.durationRange[0] && songDurationMinutes <= filters.durationRange[1]

    return matchesSearch && matchesKey && matchesBpm && matchesDuration
  })

  const stats = {
    totalSongs: songs.length,
    totalDuration: songs.reduce((acc, song) => acc + song.duration_minutes + song.duration_seconds / 60, 0),
    averageBpm: songs.length > 0 ? Math.round(songs.reduce((acc, song) => acc + song.bpm, 0) / songs.length) : 0,
    keyDistribution: songs.reduce(
      (acc, song) => {
        acc[song.key] = (acc[song.key] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
    mostUsedKey: "",
  }

  // Find most used key
  if (Object.keys(stats.keyDistribution).length > 0) {
    stats.mostUsedKey = Object.entries(stats.keyDistribution).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
  }

  // Get unique keys for filter dropdown
  const uniqueKeys = Array.from(new Set(songs.map((song) => song.key))).sort()

  const formatDuration = (minutes: number, seconds: number) => {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const formatTotalDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round(totalMinutes % 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  if (loading) {
    return <div className="text-center py-8">Carregando músicas...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with search, filters, stats and add button */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {/* Search bar - full width on mobile */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por música ou artista..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 h-12"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {/* Desktop Stats and Filters */}
            <div className="hidden sm:flex gap-2 flex-1">
              <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Estatísticas
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Mobile Stats and Filters using Sheets */}
            <div className="sm:hidden flex gap-2 flex-1">
              <Sheet open={isStatsSheetOpen} onOpenChange={setIsStatsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Stats
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Estatísticas do Repertório</SheetTitle>
                  </SheetHeader>
                  <div className="grid gap-4 mt-6">
                    <StatsCard title="Total de Músicas" value={stats.totalSongs.toString()} icon={Music} />
                    <StatsCard
                      title="Duração Total"
                      value={formatTotalDuration(stats.totalDuration)}
                      icon={Clock}
                      description="Tempo total do repertório"
                    />
                    <StatsCard
                      title="BPM Médio"
                      value={stats.averageBpm.toString()}
                      icon={Zap}
                      description="Média de batidas por minuto"
                    />
                    <StatsCard
                      title="Tom Mais Usado"
                      value={stats.mostUsedKey || "N/A"}
                      icon={Music}
                      description={`${stats.keyDistribution[stats.mostUsedKey] || 0} músicas`}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <Sheet open={isFiltersSheetOpen} onOpenChange={setIsFiltersSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Filtros Avançados</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label>Tonalidade</Label>
                      <Select value={filters.key} onValueChange={(value) => setFilters({ ...filters, key: value })}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Todas as tonalidades" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as tonalidades</SelectItem>
                          {uniqueKeys.map((key) => (
                            <SelectItem key={key} value={key}>
                              {key} ({stats.keyDistribution[key] || 0} músicas)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label>
                        BPM: {filters.bpmRange[0]} - {filters.bpmRange[1]}
                      </Label>
                      <Slider
                        value={filters.bpmRange}
                        onValueChange={(value) => setFilters({ ...filters, bpmRange: value as [number, number] })}
                        min={60}
                        max={200}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>
                        Duração (min): {filters.durationRange[0]} - {filters.durationRange[1]}
                      </Label>
                      <Slider
                        value={filters.durationRange}
                        onValueChange={(value) => setFilters({ ...filters, durationRange: value as [number, number] })}
                        min={1}
                        max={10}
                        step={0.5}
                        className="w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button variant="outline" onClick={resetFilters} className="h-12 bg-transparent">
                        Limpar Filtros
                      </Button>
                      <Badge variant="secondary" className="text-center py-2">
                        {filteredSongs.length} de {songs.length} músicas
                      </Badge>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm()
                    setEditingSong(null)
                  }}
                  className="h-12"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Adicionar Música</span>
                  <span className="sm:hidden">Adicionar</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md mx-4">
                <DialogHeader>
                  <DialogTitle>{editingSong ? "Editar Música" : "Adicionar Nova Música"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome da Música</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="artist">Artista</Label>
                    <Input
                      id="artist"
                      value={formData.artist}
                      onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="key">Tom</Label>
                    <Input
                      id="key"
                      placeholder="Ex: C, Am, F#"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="duration_minutes">Minutos</Label>
                      <Input
                        id="duration_minutes"
                        type="number"
                        min="0"
                        value={formData.duration_minutes}
                        onChange={(e) =>
                          setFormData({ ...formData, duration_minutes: Number.parseInt(e.target.value) || 0 })
                        }
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="duration_seconds">Segundos</Label>
                      <Input
                        id="duration_seconds"
                        type="number"
                        min="0"
                        max="59"
                        value={formData.duration_seconds}
                        onChange={(e) =>
                          setFormData({ ...formData, duration_seconds: Number.parseInt(e.target.value) || 0 })
                        }
                        required
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bpm">BPM</Label>
                    <Input
                      id="bpm"
                      type="number"
                      min="1"
                      value={formData.bpm}
                      onChange={(e) => setFormData({ ...formData, bpm: Number.parseInt(e.target.value) || 0 })}
                      required
                      className="h-12"
                    />
                  </div>

                  <Button type="submit" className="w-full h-12">
                    {editingSong ? "Atualizar" : "Adicionar"} Música
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Desktop Stats */}
        {showStats && (
          <div className="hidden sm:grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total de Músicas" value={stats.totalSongs.toString()} icon={Music} />
            <StatsCard
              title="Duração Total"
              value={formatTotalDuration(stats.totalDuration)}
              icon={Clock}
              description="Tempo total do repertório"
            />
            <StatsCard
              title="BPM Médio"
              value={stats.averageBpm.toString()}
              icon={Zap}
              description="Média de batidas por minuto"
            />
            <StatsCard
              title="Tom Mais Usado"
              value={stats.mostUsedKey || "N/A"}
              icon={Music}
              description={`${stats.keyDistribution[stats.mostUsedKey] || 0} músicas`}
            />
          </div>
        )}

        {/* Desktop Filters */}
        {showFilters && (
          <Card className="hidden sm:block">
            <CardHeader>
              <CardTitle className="text-lg">Filtros Avançados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Tonalidade</Label>
                  <Select value={filters.key} onValueChange={(value) => setFilters({ ...filters, key: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as tonalidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as tonalidades</SelectItem>
                      {uniqueKeys.map((key) => (
                        <SelectItem key={key} value={key}>
                          {key} ({stats.keyDistribution[key] || 0} músicas)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    BPM: {filters.bpmRange[0]} - {filters.bpmRange[1]}
                  </Label>
                  <Slider
                    value={filters.bpmRange}
                    onValueChange={(value) => setFilters({ ...filters, bpmRange: value as [number, number] })}
                    min={60}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Duração (min): {filters.durationRange[0]} - {filters.durationRange[1]}
                  </Label>
                  <Slider
                    value={filters.durationRange}
                    onValueChange={(value) => setFilters({ ...filters, durationRange: value as [number, number] })}
                    min={1}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Limpar Filtros
                </Button>
                <Badge variant="secondary">
                  {filteredSongs.length} de {songs.length} músicas
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Drag & Drop Instructions */}
      <div className="bg-muted/50 border border-dashed border-muted-foreground/25 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          💡 <strong>Dica:</strong> Arraste as músicas para os shows na aba "Meus Shows" para criar seus setlists!
        </p>
      </div>

      {/* Songs grid */}
      {filteredSongs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filters.search || filters.key !== "all" || showFilters
                ? "Nenhuma música encontrada"
                : "Nenhuma música cadastrada"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {filters.search || filters.key !== "all" || showFilters
                ? "Tente ajustar os filtros ou buscar por outros termos."
                : "Comece adicionando suas primeiras músicas ao repertório."}
            </p>
            {!filters.search && filters.key === "all" && !showFilters && (
              <Button onClick={() => setIsDialogOpen(true)} className="h-12">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Música
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSongs.map((song) => (
            <Card
              key={song.id}
              className={`hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                draggedSong?.id === song.id ? "opacity-50 scale-95" : ""
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, song)}
              onDragEnd={handleDragEnd}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <GripVertical className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{song.name}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(song)} className="h-9 w-9 p-0">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(song.id)} className="h-9 w-9 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <Music className="w-3 h-3 mr-1" />
                    {song.key}
                  </Badge>
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDuration(song.duration_minutes, song.duration_seconds)}
                  </Badge>
                  <Badge variant="secondary">
                    <Zap className="w-3 h-3 mr-1" />
                    {song.bpm} BPM
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
