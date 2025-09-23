"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Music,
  Clock,
  Zap,
  Edit,
  Trash2,
  GripVertical,
  Search,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type Song = {
  id: string;
  title: string;
  artist: string;
  tone: string;
  bpm?: number;
  duration?: number;
  created_at: string;
};

interface MusicLibraryProps {
  onDataChange: () => void;
}

export function MusicLibrary({ onDataChange }: MusicLibraryProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [draggedSong, setDraggedSong] = useState<Song | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    tone: "",
    bpm: "",
    duration_minutes: "",
    duration_seconds: "",
  });

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/songs");
      if (!response.ok) throw new Error("Erro ao buscar músicas");
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      console.error("Erro ao carregar músicas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as músicas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingSong ? `/api/songs/${editingSong.id}` : "/api/songs";
    const method = editingSong ? "PUT" : "POST";
    const durationInSeconds = (Number(formData.duration_minutes) || 0) * 60 + (Number(formData.duration_seconds) || 0);
    const submissionData = { title: formData.title, artist: formData.artist, tone: formData.tone, bpm: Number(formData.bpm) || null, duration: durationInSeconds || null, };
    try {
      const response = await fetch(url, { method: method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(submissionData), });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Erro ao salvar música"); }
      toast({ title: "Sucesso", description: `Música ${editingSong ? "atualizada" : "adicionada"}!`, });
      setIsDialogOpen(false);
      resetForm();
      await fetchSongs();
      onDataChange();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive", });
    }
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      artist: song.artist,
      tone: song.tone,
      bpm: song.bpm?.toString() || "",
      duration_minutes: song.duration ? Math.floor(song.duration / 60).toString() : "",
      duration_seconds: song.duration ? (song.duration % 60).toString() : "",
    });
    setIsDialogOpen(true);
  };
  
  const executeDelete = async () => {
    if (!songToDelete) return;
    try {
      const response = await fetch(`/api/songs/${songToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao deletar música");
      toast({ title: "Sucesso", description: `Música "${songToDelete.title}" excluída.` });
      await fetchSongs();
      onDataChange();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSongToDelete(null);
    }
  };
  
  const handleDragStart = (e: React.DragEvent, song: Song) => {
    setDraggedSong(song);
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
      bpm: "",
      duration_minutes: "",
      duration_seconds: "",
    });
  };

  const formatDuration = (totalSeconds: number = 0) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.artist &&
        song.artist.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
            <DialogContent className="w-[90vw] max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingSong ? "Editar Música" : "Adicionar Nova Música"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2"><Label htmlFor="title">Nome da Música</Label><Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="h-12" /></div>
                <div className="grid gap-2"><Label htmlFor="artist">Artista</Label><Input id="artist" value={formData.artist} onChange={(e) => setFormData({ ...formData, artist: e.target.value })} className="h-12" /></div>
                <div className="grid gap-2"><Label htmlFor="tone">Tom</Label><Input id="tone" placeholder="Ex: C, Am, F#" value={formData.tone} onChange={(e) => setFormData({ ...formData, tone: e.target.value })} className="h-12" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label htmlFor="duration_minutes">Minutos</Label><Input id="duration_minutes" type="number" min="0" placeholder="Ex: 3" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} /></div>
                  <div className="grid gap-2"><Label htmlFor="duration_seconds">Segundos</Label><Input id="duration_seconds" type="number" min="0" max="59" placeholder="Ex: 45" value={formData.duration_seconds} onChange={(e) => setFormData({ ...formData, duration_seconds: e.target.value })} /></div>
                </div>
                <div className="grid gap-2"><Label htmlFor="bpm">BPM (opcional)</Label><Input id="bpm" type="number" min="1" placeholder="Ex: 128" value={formData.bpm} onChange={(e) => setFormData({ ...formData, bpm: e.target.value })} /></div>
                <Button type="submit" className="w-full h-12">{editingSong ? "Atualizar" : "Adicionar"} Música</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {filteredSongs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Nenhuma música cadastrada</h3>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSongs.map((song) => (
              <Card key={song.id} className={`hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${ draggedSong?.id === song.id ? "opacity-50" : "" }`} draggable onDragStart={(e) => handleDragStart(e, song)} onDragEnd={handleDragEnd}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1 min-w-0"><GripVertical className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" /><div className="flex-1 min-w-0"><CardTitle className="text-lg break-words">{song.title}</CardTitle><p className="text-sm text-muted-foreground break-words">{song.artist || "Artista não informado"}</p></div></div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(song)} className="h-9 w-9 p-0"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setSongToDelete(song)} className="h-9 w-9 p-0 text-destructive hover:bg-[#021c25] hover:text-white rounded-full"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0"><div className="flex flex-wrap gap-2"><Badge variant="secondary"><Music className="w-3 h-3 mr-1" />{song.tone || "N/A"}</Badge><Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{formatDuration(song.duration)}</Badge>{song.bpm && (<Badge variant="secondary"><Zap className="w-3 h-3 mr-1" />{song.bpm} BPM</Badge>)}</div></CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <AlertDialog open={!!songToDelete} onOpenChange={(isOpen) => !isOpen && setSongToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita e irá excluir permanentemente a música<strong className="text-foreground"> "{songToDelete?.title}"</strong>.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sim, Excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}