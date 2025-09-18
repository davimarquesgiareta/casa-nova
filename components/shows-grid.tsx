"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Folder, Music, Clock, Edit, Trash2, Eye, Loader2, MessageCircle, Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { MusicLibraryForShowComponent } from "./music-library-for-show"
import { AddSongToShowMobileComponent } from "./add-song-to-show-mobile"
import { SortableSongItem } from "./sortable-song-item";

type Song = {
  id: string;
  title: string;
  artist: string;
  tone: string;
  duration?: number;
  bpm?: number;
};

type Show = {
    id: string;
    name: string;
    event_date: string;
    venue: string;
    show_time?: string;
    created_at: string;
    song_count: number;
};

type ShowDetails = Show & {
    songs: Song[];
};

const PRESET_CONTACTS = [
  { name: "Ju Galvão", number: "19981664257" },
  { name: "Pedro", number: "35997242550" },
  { name: "Renan", number: "35999050667" },
  { name: "Davi", number: "19989305698" },
];

export function ShowsGrid() {
  const isMobile = useIsMobile();
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingShow, setEditingShow] = useState<Show | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedShow, setSelectedShow] = useState<ShowDetails | null>(null)
  const [isShowDetailOpen, setIsShowDetailOpen] = useState(false)
  const [dragOverShow, setDragOverShow] = useState<string | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({ name: "", venue: "", event_date: "", show_time: "" });
  
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  
  const [showToClone, setShowToClone] = useState<Show | null>(null);
  const [showToDelete, setShowToDelete] = useState<Show | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleCloseDetailModal = () => {
    setIsShowDetailOpen(false);
    setSelectedShow(null);
    fetchShows();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingShow ? `/api/shows/${editingShow.id}` : '/api/shows';
    const method = editingShow ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!response.ok) { const err = await response.json(); throw new Error(err.error); }
      toast({ title: "Sucesso", description: `Show ${editingShow ? 'atualizado' : 'criado'}!` });
      setIsDialogOpen(false);
      resetForm();
      fetchShows();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (show: Show) => {
    setEditingShow(show);
    setFormData({ name: show.name, venue: show.venue || "", event_date: show.event_date ? show.event_date.split('T')[0] : "", show_time: show.show_time || "" });
    setIsDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!showToDelete) return;
    try {
      const response = await fetch(`/api/shows/${showToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao deletar show');
      toast({ title: "Sucesso", description: `Show "${showToDelete.name}" excluído!` });
      fetchShows();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível excluir o show.", variant: "destructive" });
    } finally {
      setShowToDelete(null);
    }
  };

  const executeClone = async () => {
    if (!showToClone) return;
    try {
      const response = await fetch(`/api/shows/${showToClone.id}/clone`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error("Não foi possível clonar o repertório.");
      }
      toast({
        title: "Sucesso!",
        description: `Repertório "${showToClone.name}" clonado.`,
      });
      fetchShows();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setShowToClone(null);
    }
  };

  const handleViewShow = async (show: Show) => {
    try {
      const response = await fetch(`/api/shows/${show.id}/songs`);
      if(!response.ok) throw new Error('Erro ao buscar repertório');
      const songsData = await response.json();
      const fullShowDetails: ShowDetails = { ...show, songs: songsData };
      setSelectedShow(fullShowDetails);
      setIsShowDetailOpen(true);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar detalhes.", variant: "destructive" });
    }
  };

  const handleAddSongToShow = async (song: Song, showId: string) => {
    if (!selectedShow) return;
    if (selectedShow.songs.find(s => s.id === song.id)) {
      toast({ title: "Aviso", description: "Essa música já está no repertório." });
      return;
    }
    const optimisticSongs = [...selectedShow.songs, song];
    setSelectedShow({ ...selectedShow, songs: optimisticSongs });
    try {
      const response = await fetch(`/api/shows/${showId}/songs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ song_id: song.id }) });
      if(!response.ok) {
        setSelectedShow({ ...selectedShow, songs: selectedShow.songs });
        const err = await response.json();
        throw new Error(err.error);
      };
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      setSelectedShow({ ...selectedShow, songs: selectedShow.songs });
    }
  };

  const handleRemoveSongFromShow = async (songId: string) => {
    if(!selectedShow) return;
    const originalSongs = selectedShow.songs;
    const optimisticSongs = originalSongs.filter(s => s.id !== songId);
    setSelectedShow({ ...selectedShow, songs: optimisticSongs });
    try {
      const response = await fetch(`/api/shows/${selectedShow.id}/songs/${songId}`, { method: 'DELETE' });
      if(!response.ok) {
        setSelectedShow({ ...selectedShow, songs: originalSongs });
        throw new Error('Erro ao remover música');
      }
      fetchShows();
    } catch(error) {
      toast({ title: "Erro", description: "Não foi possível remover.", variant: "destructive" });
    }
  };

  const handleDragOver = (e: React.DragEvent, showId: string) => { e.preventDefault(); setDragOverShow(showId); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOverShow(null); };
  const handleDropOnCard = (e: React.DragEvent, showId: string) => { e.preventDefault(); setDragOverShow(null); const songData = JSON.parse(e.dataTransfer.getData("application/json")) as Song; fetch(`/api/shows/${showId}/songs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ song_id: songData.id }) }).then(res => { if(res.ok) { toast({ title: "Música adicionada!", description: `"${songData.title}" adicionada a "${shows.find(s=>s.id===showId)?.name}".`}); fetchShows(); } else { toast({ title: "Erro", description: "Não foi possível adicionar a música.", variant: "destructive"}); } }); };
  const resetForm = () => { setFormData({ name: "", venue: "", event_date: "", show_time: "" }); };
  const calculateTotalDuration = (songs: Song[] = []) => { const totalSeconds = songs.reduce((acc, song) => acc + (song.duration || 0), 0); const minutes = Math.floor(totalSeconds / 60); const seconds = totalSeconds % 60; return `${minutes}m ${seconds.toString().padStart(2, '0')}s`; }
  const filteredShows = shows.filter((show) => show.name.toLowerCase().includes(searchTerm.toLowerCase()));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id && selectedShow) {
      const oldIndex = selectedShow.songs.findIndex(s => s.id === active.id);
      const newIndex = selectedShow.songs.findIndex(s => s.id === over.id);
      const newSongs = arrayMove(selectedShow.songs, oldIndex, newIndex);
      setSelectedShow({ ...selectedShow, songs: newSongs });
      const songIdsInNewOrder = newSongs.map(song => song.id);
      fetch(`/api/shows/${selectedShow.id}/songs/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songIds: songIdsInNewOrder }),
      }).then(res => {
        if (res.ok) {
          toast({ title: "Sucesso", description: "Ordem do repertório salva!" });
        } else { throw new Error("Falha ao salvar a nova ordem."); }
      }).catch(err => {
        toast({ title: "Erro", description: err.message, variant: "destructive" });
        setSelectedShow({ ...selectedShow, songs: selectedShow.songs });
      });
    }
  }

  const handleDropOnSetlist = (e: React.DragEvent) => {
      e.preventDefault();
      const source = e.dataTransfer.getData("source");
      if (source !== "setlist") {
        if (selectedShow) {
            const songData = JSON.parse(e.dataTransfer.getData("application/json")) as Song;
            handleAddSongToShow(songData, selectedShow.id);
        }
      }
  }

  const handleSendToWhatsApp = () => {
    if (!selectedShow) return;
    if (!whatsappNumber.trim()) {
      toast({ title: "Erro", description: "Por favor, insira ou selecione um número.", variant: "destructive" });
      return;
    }
    const cleanNumber = `55${whatsappNumber.replace(/\D/g, "")}`;
    let message = `*${selectedShow.name}* 🎵\n\n`;
    if (selectedShow.venue) message += `*Local:* ${selectedShow.venue}\n`;
    if (selectedShow.event_date) {
        const date = new Date(selectedShow.event_date);
        const formattedDate = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
        message += `*Data:* ${formattedDate}\n`;
    }
    if (selectedShow.show_time) message += `*Horário:* ${selectedShow.show_time}\n`;
    message += `\n*REPERTÓRIO:*\n`;
    selectedShow.songs.forEach((song, index) => {
      message += `${index + 1}. ${song.title} - _${song.artist}_\n`;
    });
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    setIsWhatsAppModalOpen(false);
    setWhatsappNumber("");
  }

  if (loading) { return ( <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> ); }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Input placeholder="Buscar shows..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-12 flex-1"/>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={() => { resetForm(); setEditingShow(null); }} className="h-12 w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" />Criar Show</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{editingShow ? "Editar Show" : "Criar Novo Show"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2"><Label htmlFor="name">Nome do Show</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div className="grid gap-2"><Label htmlFor="venue">Local (opcional)</Label><Input id="venue" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label htmlFor="event_date">Data (opcional)</Label><Input id="event_date" type="date" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} /></div>
                <div className="grid gap-2"><Label htmlFor="show_time">Horário (opcional)</Label><Input id="show_time" type="time" value={formData.show_time} onChange={(e) => setFormData({ ...formData, show_time: e.target.value })} /></div>
              </div>
              <Button type="submit" className="w-full">{editingShow ? "Atualizar" : "Criar"} Show</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filteredShows.length === 0 ? (
        <Card><CardContent className="text-center py-12"><Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold">Nenhum show criado</h3></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredShows.map((show) => (
            <Card key={show.id} className={`hover:shadow-md transition-all ${dragOverShow === show.id ? "ring-2 ring-primary" : ""}`} onDragOver={(e) => handleDragOver(e, show.id)} onDragLeave={handleDragLeave} onDrop={(e) => handleDropOnCard(e, show.id)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg truncate flex items-center gap-2"><Folder className="w-5 h-5 text-primary" />{show.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleViewShow(show)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowToClone(show)}><Copy className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(show)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowToDelete(show)} className="text-destructive hover:bg-[#021c25] hover:text-white rounded-full">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0"><Badge variant="secondary"><Music className="w-3 h-3 mr-1" />{show.song_count} músicas</Badge></CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={isShowDetailOpen} onOpenChange={(isOpen) => !isOpen && handleCloseDetailModal()}>
        {/* ... Conteúdo do modal de detalhes do show ... */}
      </Dialog>

      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        {/* ... Conteúdo do modal do WhatsApp ... */}
      </Dialog>
      
      <AlertDialog open={!!showToClone} onOpenChange={(isOpen) => !isOpen && setShowToClone(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Clonagem</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja criar uma cópia do repertório
              <strong className="text-foreground"> "{showToClone?.name}"</strong>?
              Um novo show será criado com todas as músicas deste.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeClone}>Sim, Clonar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!showToDelete} onOpenChange={(isOpen) => !isOpen && setShowToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o repertório
              <strong className="text-foreground"> "{showToDelete?.name}"</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}