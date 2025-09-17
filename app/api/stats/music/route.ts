// src/app/api/stats/music/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  // Chamamos a função RPC que criamos no Supabase
  const { data, error } = await supabase
    .rpc('get_music_library_stats')
    .single() // .single() é usado porque a função retorna apenas uma linha

  if (error) {
    console.error('Erro ao buscar estatísticas de músicas:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}