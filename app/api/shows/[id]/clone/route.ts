// src/app/api/shows/[id]/clone/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Rota POST para clonar um show
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const showIdToClone = params.id

  try {
    const { data, error } = await supabase.rpc('clone_show', {
      original_show_id: showIdToClone,
    })

    if (error) {
      console.error('Erro ao clonar show:', error)
      throw new Error('Falha ao clonar o repertório no banco de dados.')
    }

    return NextResponse.json({ newShowId: data }, { status: 201 })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}