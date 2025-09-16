// components/music-library.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
// MUDANÇA: O tipo Song que definimos antes pode ser importado ou redefinido aqui.
// Vamos garantir que ele corresponda à nossa API.
type Song = {
  id: string;
  title: string;
  artist: string;
  tone: string; // Renomeado de 'key' para 'tone' na API
  youtube_url?: string;
  created_at: string;
  // Campos do formulário que não vêm da API
  duration_minutes?: number;
  duration_seconds?: number;
  bpm?: number;
};

// ... (importações de componentes UI permanecem as mesmas)
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Music, Clock, Zap, Edit, Trash2, GripVertical, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast" // Corrigi o caminho do import

export function MusicLibrary() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [draggedSong, setDraggedSong] = useState<Song | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    tone: "",
  })

  // MUDANÇA 1: Simplificamos a função para buscar dados da NOSSA API
  const fetchSongs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/songs');
      if (!response.ok) {
        throw new Error('Erro ao buscar músicas');
      }
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      console.error("Erro ao carregar músicas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as músicas da API.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSongs();
  }, []);


  // MUDANÇA 2: A função de submit agora chama a API para criar ou editar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingSong ? `/api/songs/${editingSong.id}` : '/api/songs';
    const method = editingSong ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar música');
      }

      toast({
        title: "Sucesso",
        description: editingSong ? "Música atualizada com sucesso!" : "Música adicionada com sucesso!",
      });

      setIsDialogOpen(false);
      setEditingSong(null);
      resetForm();
      fetchSongs(); // Re-busca as músicas para atualizar a lista
    } catch (error: any) {
      console.error("Erro ao salvar música:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a música.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      artist: song.artist,
      tone: song.tone,
    });
    setIsDialogOpen(true);
  };

  // MUDANÇA 3: A função de deletar agora chama a API
  const handleDelete = async (songId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta música?")) return;

    try {
      const response = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar música');
      }

      toast({
        title: "Sucesso",
        description: "Música excluída com sucesso!",
      });
      fetchSongs(); // Re-busca as músicas para atualizar a lista
    } catch (error: any) {
      console.error("Erro ao excluir música:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a música.",
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, song: Song) => {
    setDraggedSong(song);
    // IMPORTANTE: O drag-and-drop para os shows ainda vai usar o localStorage por enquanto.
    // Vamos refatorar isso quando mexermos no ShowsGrid.
    e.dataTransfer.setData("application/json", JSON.stringify(song));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = () => {
    setDraggedSong(null);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      artist: "",
      tone: "",
    });
  };

  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (song.artist && song.artist.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // O restante do JSX (a parte visual do componente) permanece praticamente o mesmo.
  // Apenas ajustei os campos do formulário para refletir o novo `formData`.

  if (loading) {
    return <div className="text-center py-8">Carregando músicas da nuvem...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por música ou artista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setEditingSong(null);
              }}
              className="h-12 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Música
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>{editingSong ? "Editar Música" : "Adicionar Nova Música"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Nome da Música</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="h-12" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="artist">Artista</Label>
                <Input id="artist" value={formData.artist} onChange={(e) => setFormData({ ...formData, artist: e.target.value })} className="h-12" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tone">Tom</Label>
                <Input id="tone" placeholder="Ex: C, Am, F#" value={formData.tone} onChange={(e) => setFormData({ ...formData, tone: e.target.value })} className="h-12" />
              </div>
              <Button type="submit" className="w-full h-12">
                {editingSong ? "Atualizar" : "Adicionar"} Música
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filteredSongs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "Nenhuma música encontrada" : "Nenhuma música cadastrada"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Tente buscar por outros termos." : "Comece adicionando suas primeiras músicas ao repertório."}
            </p>
            {!searchTerm && (
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
              className={`hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${draggedSong?.id === song.id ? "opacity-50 scale-95" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, song)}
              onDragEnd={handleDragEnd}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <GripVertical className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{song.title}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate">{song.artist || 'Artista não informado'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(song)} className="h-9 w-9 p-0">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(song.id)} className="h-9 w-9 p-0 text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <Music className="w-3 h-3 mr-1" />
                    {song.tone || 'N/A'}
                  </Badge>
                  {/* Os campos de BPM e Duração foram removidos do form/exibição para simplificar,
                      já que nossa API inicial não os incluía. Podemos adicioná-los de volta depois. */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}