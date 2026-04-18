'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import type { UserInsert, UserUpdate } from '@/lib/types'

function getSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()  { return cookieStore.getAll() },
        setAll()  {},
      },
    }
  )
}

// ─── Listar usuarios ──────────────────────────────────────────
export async function getUsers() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('users')
    .select(`*, company:companies(id, name)`)
    .order('full_name', { ascending: true })
  if (error) throw error
  return data
}

// ─── Obtener usuario por ID ───────────────────────────────────
export async function getUser(id: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('users')
    .select(`*, company:companies(id, name)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ─── Actualizar usuario ───────────────────────────────────────
export async function updateUser(id: string, payload: UserUpdate) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/admin/users')
  return data
}
