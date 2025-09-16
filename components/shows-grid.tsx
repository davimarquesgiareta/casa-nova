// components/shows-grid.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"

// MUDANÇA: Tipos atualizados para refletir a API
type Song = {
  id: string;
  title: string;
  artist: string;
  tone: string;
};

type Show = {
    id: string;
    name: string;
    event_date: string;
    venue: string;
    created_at: string;
    song_count: number; // Vem da nossa nova função SQL
};

type ShowDetails = Show & {
    songs: Song[];
};


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Folder, Music, Clock, Edit, Trash2, Eye, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { MusicLibraryForShowComponent } from "./music-library-for-show" // Usaremos este componente

export function ShowsGrid() {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingShow, setEditingShow] = useState<Show | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedShow, setSelectedShow] = useState<ShowDetails | null>(null)
  const [isShowDetailOpen, setIsShowDetailOpen] = useState(false)
  const [dragOverShow, setDragOverShow] = useState<string | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    venue: "",
    event_date: "",
  });

  // MUDANÇA 1: Buscar shows da nossa API
  const fetchShows = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shows');
      if (!response.ok) throw new Error('Erro ao buscar shows');
      const data = await response.json();
      setShows(data);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os shows.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  // MUDANÇA 2: Salvar ou editar show via API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingShow ? `/api/shows/${editingShow.id}` : '/api/shows';
    const method = editingShow ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error);
      }
      
      toast({ title: "Sucesso", description: `Show ${editingShow ? 'atualizado' : 'criado'} com sucesso!` });
      setIsDialogOpen(false);
      setEditingShow(null);
      resetForm();
      fetchShows();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (show: Show) => {
    setEditingShow(show);
    setFormData({
      name: show.name,
      venue: show.venue || "",
      event_date: show.event_date ? show.event_date.split('T')[0] : "", // Formata para input date
    });
    setIsDialogOpen(true);
  };

  // MUDANÇA 3: Deletar show via API
  const handleDelete = async (showId: string) => {
    if (!confirm("Tem certeza que deseja excluir este show?")) return;

    try {
      const response = await fetch(`/api/shows/${showId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao deletar show');
      
      toast({ title: "Sucesso", description: "Show excluído com sucesso!" });
      fetchShows();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível excluir o show.", variant: "destructive" });
    }
  };

  // MUDANÇA 4: Abrir detalhes e buscar o repertório específico daquele show
  const handleViewShow = async (show: Show) => {
    try {
        const response = await fetch(`/api/shows/${show.id}/songs`);
        if(!response.ok) throw new Error('Erro ao buscar repertório');
        const songsData = await response.json();
        setSelectedShow({ ...show, songs: songsData });
        setIsShowDetailOpen(true);
    } catch (error) {
        toast({ title: "Erro", description: "Não foi possível carregar os detalhes do show.", variant: "destructive" });
    }
  };

  // MUDANÇA 5: Adicionar música ao show via API (usado pelo clique e drag-and-drop)
  const handleAddSongToShow = async (song: Song, showId: string) => {
      // Evita adicionar música duplicada visualmente antes da API responder
      if (selectedShow && selectedShow.songs.find(s => s.id === song.id)) {
        toast({ title: "Aviso", description: "Essa música já está no repertório.", variant: "default" });
        return;
      }

      try {
          const response = await fetch(`/api/shows/${showId}/songs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ song_id: song.id })
          });
          if(!response.ok) {
              const err = await response.json();
              throw new Error(err.error);
          };
          toast({ title: "Sucesso", description: `"${song.title}" adicionada ao show!` });
          
          // Atualiza a lista de shows e o show selecionado
          fetchShows(); 
          if(selectedShow) {
              handleViewShow({ ...selectedShow, song_count: selectedShow.song_count + 1});
          }
      } catch (error: any) {
          toast({ title: "Erro", description: error.message, variant: "destructive" });
      }
  };

  // MUDANÇA 6: Remover música do show via API
  const handleRemoveSongFromShow = async (songId: string) => {
    if(!selectedShow) return;
    try {
        const response = await fetch(`/api/shows/${selectedShow.id}/songs/${songId}`, {
            method: 'DELETE'
        });
        if(!response.ok) throw new Error('Erro ao remover música');
        toast({ title: "Sucesso", description: "Música removida do show!" });
        
        fetchShows();
        if(selectedShow) {
            handleViewShow({ ...selectedShow, song_count: selectedShow.song_count - 1});
        }
    } catch(error) {
        toast({ title: "Erro", description: "Não foi possível remover a música.", variant: "destructive" });
    }
  }

  // Lógica de Drag and Drop
  const handleDragOver = (e: React.DragEvent, showId: string) => { e.preventDefault(); setDragOverShow(showId); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOverShow(null); };
  const handleDrop = (e: React.DragEvent, showId: string) => {
    e.preventDefault();
    setDragOverShow(null);
    const songData = JSON.parse(e.dataTransfer.getData("application/json")) as Song;
    handleAddSongToShow(songData, showId);
  };

  const resetForm = () => {
    setFormData({ name: "", venue: "", event_date: "" });
  };

  const filteredShows = shows.filter((show) => show.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return <div className="text-center py-8">Carregando shows...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header com busca e botão de criar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Input placeholder="Buscar shows..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-12 flex-1"/>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingShow(null); }} className="h-12 w-full sm:w-auto">
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
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="venue">Local (opcional)</Label>
                <Input id="venue" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event_date">Data (opcional)</Label>
                <Input id="event_date" type="date" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">{editingShow ? "Atualizar" : "Criar"} Show</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de Shows */}
      {filteredShows.length === 0 ? (
        <Card><CardContent className="text-center py-12"><Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold">Nenhum show criado</h3></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredShows.map((show) => (
            <Card key={show.id} className={`hover:shadow-md transition-all ${dragOverShow === show.id ? "ring-2 ring-primary" : ""}`} onDragOver={(e) => handleDragOver(e, show.id)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, show.id)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg truncate flex items-center gap-2"><Folder className="w-5 h-5 text-primary" />{show.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleViewShow(show)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(show)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(show.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Badge variant="secondary"><Music className="w-3 h-3 mr-1" />{show.song_count} músicas</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Dialog de Detalhes do Show */}
      <Dialog open={isShowDetailOpen} onOpenChange={setIsShowDetailOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle>{selectedShow?.name}</DialogTitle></DialogHeader>
          {selectedShow && (
            <div className="grid lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                {/* Lado Esquerdo: Setlist */}
                <div className="flex flex-col min-h-0">
                    <h4 className="font-semibold mb-2 text-lg">Repertório</h4>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {selectedShow.songs.length === 0 ? (
                            <div className="text-center text-muted-foreground py-10">Arraste músicas da biblioteca para cá.</div>
                        ) : (
                            selectedShow.songs.map((song, index) => (
                                <Card key={song.id}>
                                    <CardContent className="p-3 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                                        <div>
                                            <p className="font-semibold">{song.title}</p>
                                            <p className="text-sm text-muted-foreground">{song.artist}</p>
                                        </div>
                                      </div>
                                      <Button variant="ghost" size="sm" onClick={() => handleRemoveSongFromShow(song.id)} className="text-destructive hover:text-destructive"><X className="w-4 h-4" /></Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
                {/* Lado Direito: Biblioteca de músicas para adicionar */}
                <div className="hidden lg:flex flex-col min-h-0">
                    <h4 className="font-semibold mb-2 text-lg">Biblioteca</h4>
                    {/* Precisaremos refatorar o MusicLibraryForShowComponent também */}
                    <MusicLibraryForShowComponent onAddSong={(song) => handleAddSongToShow(song, selectedShow.id)} showSongs={selectedShow.songs} />
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}