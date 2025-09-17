// src/app/api/shows/[id]/songs/reorder/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Rota PUT para atualizar a ordem das músicas
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const showId = params.id
  try {
    // Esperamos um array de song_ids no corpo da requisição
    const { songIds } = await request.json()

    if (!Array.isArray(songIds)) {
      return NextResponse.json({ error: 'O corpo da requisição deve conter um array de songIds.' }, { status: 400 })
    }

    // Mapeamos o array para o formato que o Supabase espera para um 'upsert'
    const updates = songIds.map((songId, index) => ({
      show_id: showId,
      song_id: songId,
      song_order: index, // A nova ordem é o índice no array
    }))

    // Usamos 'upsert' para atualizar a ordem de cada música no show
    const { error } = await supabase.from('show_songs').upsert(updates, {
      onConflict: 'show_id, song_id', // Se o par show/música já existe, ele apenas atualiza
    })

    if (error) {
      console.error('Erro ao reordenar músicas:', error)
      throw new Error('Falha ao atualizar a ordem no banco de dados.')
    }

    return NextResponse.json({ message: 'Repertório reordenado com sucesso.' }, { status: 200 })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}