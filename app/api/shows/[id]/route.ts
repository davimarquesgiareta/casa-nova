// app/api/shows/[id]/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// A função GET (por ID) continua a mesma
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    const { data, error } = await supabase
        .from('shows')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return NextResponse.json({ error: 'Show não encontrado.' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// Função para ATUALIZAR um show (PUT)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const body = await request.json();

    // MUDANÇA: Convertemos strings vazias para null antes de enviar
    const showData = {
        name: body.name,
        venue: body.venue || null,
        event_date: body.event_date || null,
        show_time: body.show_time || null,
    };

    const { data, error } = await supabase
        .from('shows')
        .update(showData) // Usamos os dados já tratados
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
        return NextResponse.json({ error: 'Show não encontrado para atualização.' }, { status: 404 });
    }
    return NextResponse.json(data);
}

// A função DELETE continua a mesma
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    const { error, count } = await supabase
        .from('shows')
        .delete({ count: 'exact' })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (count === 0) {
        return NextResponse.json({ error: 'Show não encontrado para deleção.' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
}