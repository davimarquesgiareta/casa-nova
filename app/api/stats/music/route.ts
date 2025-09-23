import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// MUDANÇA: Esta linha força a rota a ser sempre dinâmica, desativando o cache.
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  const { data, error } = await supabase
    .rpc('get_music_library_stats')
    .single()

  if (error) {
    console.error('Erro ao buscar estatísticas de músicas:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}