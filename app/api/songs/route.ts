// src/app/api/songs/route.ts

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Não coloque as chaves diretamente aqui! O Next.js as pega do .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para LISTAR todas as músicas (GET)
export async function GET() {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false }); // Lista as mais novas primeiro

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Função para CRIAR uma nova música (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validação simples para garantir que o título foi enviado
    if (!body.title) {
      return NextResponse.json(
        { error: "O título da música é obrigatório." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("songs")
      .insert([
        {
          title: body.title,
          artist: body.artist,
          tone: body.tone,
          youtube_url: body.youtube_url,
        },
      ])
      .select() // Retorna o objeto inserido
      .single(); // Retorna como um objeto único, não um array

    if (error) {
      console.error("Erro do Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 }); // 201 Created
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao processar a requisição." },
      { status: 400 }
    );
  }
}
