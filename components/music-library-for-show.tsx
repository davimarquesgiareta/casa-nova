// components/music-library-for-show.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";

type Song = {
  id: string;
  title: string;
  artist: string;
  tone: string;
};

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Music, Search, GripVertical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface MusicLibraryForShowProps {
  onAddSong: (song: Song) => void;
  showSongs: Song[]; // Músicas que já estão no show
}

export function MusicLibraryForShowComponent({
  onAddSong,
  showSongs,
}: MusicLibraryForShowProps) {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // MUDANÇA: Busca todas as músicas da biblioteca via API
  useEffect(() => {
    const fetchAllSongs = async () => {
      try {
        const response = await fetch("/api/songs");
        if (!response.ok) throw new Error("Falha ao buscar músicas");
        const data = await response.json();
        setAllSongs(data);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar a biblioteca de músicas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAllSongs();
  }, [toast]);

  const handleDragStart = (e: React.DragEvent, song: Song) => {
    e.dataTransfer.setData("application/json", JSON.stringify(song));
    e.dataTransfer.effectAllowed = "copy";
  };

  // Filtra as músicas para não mostrar as que já estão no show
  const availableSongs = allSongs.filter(
    (song) => !showSongs.some((showSong) => showSong.id === song.id)
  );

  const filteredSongs = availableSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.artist &&
        song.artist.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="text-center py-8">Carregando biblioteca...</div>;
  }

  return (
    <div className="space-y-4 h-full flex flex-col min-h-0">
      <div className="relative flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar músicas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
        {filteredSongs.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            Nenhuma música disponível.
          </div>
        ) : (
          filteredSongs.map((song) => (
            <Card
              key={song.id}
              className="hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
              draggable
              onDragStart={(e) => handleDragStart(e, song)}
              onClick={() => onAddSong(song)}
            >
              <CardHeader className="pb-2 pt-3">
                <div className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm truncate">
                      {song.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground truncate">
                      {song.artist}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
