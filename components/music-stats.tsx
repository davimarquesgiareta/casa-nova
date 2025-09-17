// components/music-stats.tsx
"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "./stats-card"
import { Music, Clock, User, BarChart, Loader2 } from "lucide-react"

// Definimos a estrutura dos dados que a API vai retornar
type MusicStatsData = {
  total_songs: number;
  total_duration_secs: number;
  avg_duration_secs: number;
  most_frequent_artist: string;
  most_frequent_tone: string;
};

// Helper para formatar segundos para MM:SS
const formatDuration = (totalSeconds: number = 0) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};


export function MusicStats() {
  const [stats, setStats] = useState<MusicStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stats/music');
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
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats || stats.total_songs === 0) {
    return null; // Não mostra nada se não houver músicas
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
      <StatsCard title="Total de Músicas" value={stats.total_songs.toString()} icon={Music} />
      <StatsCard title="Duração Total" value={formatDuration(stats.total_duration_secs)} icon={Clock} />
      <StatsCard title="Artista Mais Frequente" value={stats.most_frequent_artist || 'N/A'} icon={User} />
      <StatsCard title="Tom Mais Usado" value={stats.most_frequent_tone || 'N/A'} icon={BarChart} />
      <StatsCard title="Duração Média" value={`${formatDuration(Math.round(stats.avg_duration_secs))} / música`} icon={Clock} />
    </div>
  );
}