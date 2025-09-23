"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "./stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder, MapPin, User, Loader2, Star } from "lucide-react"

type TopSong = {
  title: string;
  artist: string;
  play_count: number;
}

type ShowStatsData = {
  total_shows: number;
  most_frequent_venue: string;
  most_frequent_artist: string;
  top_songs: TopSong[];
};

// 1. O componente agora espera receber a prop 'refetchTrigger'
interface ShowStatsProps {
  refetchTrigger: number;
}

export function ShowStats({ refetchTrigger }: ShowStatsProps) {
  const [stats, setStats] = useState<ShowStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. O useEffect agora depende do 'refetchTrigger'.
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stats/shows');
        if (!response.ok) throw new Error("Falha ao carregar estatísticas");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [refetchTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats || stats.total_shows === 0) {
    return null; 
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-6">
      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard title="Total de Shows" value={stats.total_shows.toString()} icon={Folder} />
        <StatsCard title="Local Mais Frequente" value={stats.most_frequent_venue || 'N/A'} icon={MapPin} />
        <StatsCard title="Artista Mais Tocado" value={stats.most_frequent_artist || 'N/A'} icon={User} />
      </div>
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Top 5 Músicas Mais Tocadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.top_songs && stats.top_songs.length > 0 ? (
              <ol className="space-y-3">
                {stats.top_songs.map((song, index) => (
                  <li key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary w-5">{index + 1}.</span>
                      <div>
                        <p className="font-semibold truncate">{song.title}</p>
                        <p className="text-muted-foreground truncate text-xs">{song.artist}</p>
                      </div>
                    </div>
                    <span className="font-bold text-muted-foreground">{song.play_count}x</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma música tocada para gerar o Top 5.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}