// src/app/api/shows/[id]/songs/[songId]/route.ts

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para DELETAR uma música de um repertório
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; songId: string } }
) {
  const showId = params.id;
  const songId = params.songId;

  const { error, count } = await supabase
    .from("show_songs")
    .delete({ count: "exact" })
    .match({ show_id: showId, song_id: songId }); // Deleta a linha que combina os dois IDs

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (count === 0) {
    return NextResponse.json(
      { error: "Música não encontrada neste show para deleção." },
      { status: 404 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
