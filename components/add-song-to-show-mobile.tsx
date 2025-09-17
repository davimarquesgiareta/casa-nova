// components/add-song-to-show-mobile.tsx
"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Music, Clock, Zap, Plus, Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Song = {
  id: string;
  title: string;
  artist: string;
  tone: string;
  duration?: number;
  bpm?: number;
};

interface AddSongToShowMobileProps {
  showId: string;
  songsInShow: Song[]; // Recebemos as músicas que já estão no show
  onSongAdded: () => void; // Função para avisar o componente pai que a lista mudou
}

export function AddSongToShowMobileComponent({ showId, songsInShow, onSongAdded }: AddSongToShowMobileProps) {
  const [librarySongs, setLibrarySongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Busca todas as músicas da biblioteca usando nossa API quando o modal abre
  useEffect(() => {
    if (isDialogOpen) {
      const fetchLibrarySongs = async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/songs");
          if (!res.ok) throw new Error("Não foi possível carregar as músicas.");
          const data = await res.json();
          setLibrarySongs(data);
        } catch (error) {
          toast({ title: "Erro", description: "Falha ao carregar a biblioteca.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      fetchLibrarySongs();
    }
  }, [isDialogOpen, toast]);

  // Adiciona a música ao show usando nossa API
  const handleAddSong = async (song: Song) => {
    try {
      const response = await fetch(`/api/shows/${showId}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song_id: song.id })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Falha ao adicionar música.");
      }

      toast({ title: "Sucesso!", description: `"${song.title}" foi adicionada.` });
      onSongAdded(); // Avisa o componente pai para atualizar
      setIsDialogOpen(false); // Fecha este modal
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  }

  // Filtra as músicas da biblioteca para não mostrar as que já estão no show
  const songsInShowIds = new Set(songsInShow.map(s => s.id));
  const availableSongs = librarySongs.filter(s => !songsInShowIds.has(s.id));

  const filteredSongs = availableSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDuration = (totalSeconds: number = 0) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-12">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Música
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader><DialogTitle>Adicionar Música ao Show</DialogTitle></DialogHeader>
        <div className="space-y-4 flex-1 min-h-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Buscar na biblioteca..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-12" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-2">
            {loading ? (
              <div className="flex justify-center items-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : filteredSongs.length === 0 ? (
              <Card><CardContent className="text-center py-8"><p className="text-muted-foreground">Nenhuma música disponível</p></CardContent></Card>
            ) : (
              filteredSongs.map((song) => (
                <Card key={song.id} className="hover:shadow-md transition-all cursor-pointer hover:bg-muted/50" onClick={() => handleAddSong(song)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm truncate">{song.title}</CardTitle>
                        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs"><Music className="w-2 h-2 mr-1" />{song.tone}</Badge>
                      <Badge variant="secondary" className="text-xs"><Clock className="w-2 h-2 mr-1" />{formatDuration(song.duration)}</Badge>
                      {song.bpm && <Badge variant="secondary" className="text-xs"><Zap className="w-2 h-2 mr-1" />{song.bpm} BPM</Badge>}
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