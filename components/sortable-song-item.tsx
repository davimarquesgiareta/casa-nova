// components/sortable-song-item.tsx
"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X } from "lucide-react";

// Definimos o tipo Song aqui também para o componente saber o que esperar
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

export function SortableSongItem({
  song,
  index,
  onRemove,
}: SortableSongItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // Propriedade para saber se o item está sendo arrastado
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Adicionamos um efeito de opacidade quando o item está sendo arrastado
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card>
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* O ícone de arrastar agora é o "handle" que a Dnd Kit usa */}
            <button
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-5 h-5 text-muted-foreground" />
            </button>
            <span className="text-sm font-bold text-primary">{index + 1}</span>
            <div>
              <p className="font-semibold">{song.title}</p>
              <p className="text-sm text-muted-foreground">{song.artist}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(song.id)}
            className="text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
