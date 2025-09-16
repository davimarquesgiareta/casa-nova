// src/app/api/shows/route.ts

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para LISTAR todos os shows (GET)
export async function GET() {
  // Usamos uma RPC (Remote Procedure Call) no Supabase para criar uma query mais complexa.
  // Esta query busca todos os shows e, para cada um, conta quantas músicas estão associadas a ele.
  const { data, error } = await supabase.rpc('get_shows_with_song_count');

  if (error) {
      console.error('Erro ao chamar RPC:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Função para CRIAR um novo show (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "O nome do show é obrigatório." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("shows")
      .insert([
        {
          name: body.name,
          event_date: body.event_date,
          venue: body.venue,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao processar a requisição." },
      { status: 400 }
    );
  }
}
