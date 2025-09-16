// src/app/api/songs/[id]/route.ts

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para OBTER uma música específica (GET by ID)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("id", id) // Filtra pelo ID
    .single(); // Espera um único resultado

  if (error) {
    // Se o erro for 'PGRST116', significa que não encontrou a música
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Música não encontrada." },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Função para ATUALIZAR uma música (PUT)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  const { data, error } = await supabase
    .from("songs")
    .update({
      title: body.title,
      artist: body.artist,
      tone: body.tone,
      youtube_url: body.youtube_url,
      bpm: body.bpm, 
      duration: body.duration, 
    })
    .eq("id", id) // Especifica qual música atualizar
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Música não encontrada para atualização." },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

// Função para DELETAR uma música (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { error, count } = await supabase
    .from("songs")
    .delete({ count: "exact" }) // Pede para retornar a contagem de linhas deletadas
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Se a contagem for 0, nenhuma música com esse ID foi encontrada
  if (count === 0) {
    return NextResponse.json(
      { error: "Música não encontrada para deleção." },
      { status: 404 }
    );
  }

  // Retorna uma resposta vazia com status 204 No Content, que é o padrão para DELETE bem-sucedido
  return new NextResponse(null, { status: 204 });
}
