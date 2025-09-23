// app/api/shows/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// A função GET continua a mesma
export async function GET() {
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
            return NextResponse.json({ error: 'O nome do show é obrigatório.' }, { status: 400 });
        }
        
        // MUDANÇA: Convertemos strings vazias para null antes de enviar
        const showData = {
            name: body.name,
            venue: body.venue || null,
            event_date: body.event_date || null,
            show_time: body.show_time || null,
        };

        const { data, error } = await supabase
            .from('shows')
            .insert([showData]) // Usamos os dados já tratados
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });

    } catch (e) {
        return NextResponse.json({ error: 'Erro ao processar a requisição.' }, { status: 400 });
    }
}