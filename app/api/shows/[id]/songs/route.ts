// src/app/api/shows/[id]/songs/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para LISTAR o repertório de um show específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const showId = params.id;

    const { data, error } = await supabase
        .from('show_songs')
        .select(`
            song_order,
            songs (
                id,
                title,
                artist,
                tone,
                duration 
            )
        `)
        .eq('show_id', showId)
        .order('song_order', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // A query retorna uma estrutura aninhada, vamos simplificá-la para o frontend
    const repertorio = data.map(item => ({
        ...item.songs, 
        song_order: item.song_order
    }));

    return NextResponse.json(repertorio);
}

// A função POST continua a mesma
export async function POST(request: Request, { params }: { params: { id: string } }) {
    const showId = params.id;
    const body = await request.json();
    const { song_id, song_order } = body;

    if (!song_id) {
        return NextResponse.json({ error: 'O ID da música é obrigatório' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('show_songs')
        .insert({
            show_id: showId,
            song_id: song_id,
            song_order: song_order
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
             return NextResponse.json({ error: 'Essa música já foi adicionada a este show.' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}