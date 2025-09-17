// components/sortable-song-item.tsx
"use client"

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GripVertical, X } from "lucide-react"

type Song = {
  id: string;
  title: string;
  artist: string;
};

interface SortableSongItemProps {
  song: Song;
  index: number;
  onRemove: (songId: string) => void;
}

export function SortableSongItem({ song, index, onRemove }: SortableSongItemProps) {
  const {
    attributes,
    listeners, // As "orelhas" que escutam o evento de arrastar
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    // MUDANÇA 1: Movemos os 'listeners' para o container principal
    // e adicionamos as classes de cursor aqui.
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="cursor-grab active:cursor-grabbing"
    >
      <Card>
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* MUDANÇA 2: O ícone agora é apenas visual, sem o <button> */}
            <GripVertical className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-bold text-primary w-6 text-center">{index + 1}</span>
            <div>
              <p className="font-semibold">{song.title}</p>
              <p className="text-sm text-muted-foreground">{song.artist}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onRemove(song.id)} className="text-destructive hover:bg-[#021c25] hover:text-white rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}