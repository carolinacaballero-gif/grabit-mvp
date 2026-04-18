'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import type { ThreadStatus } from '@/lib/types'

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

// ─── Listar todos los threads ─────────────────────────────────
export async function getThreads() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('request_threads')
    .select(`
      *,
      company:companies(id, name),
      user:users(id, full_name, email),
      thread_messages(id)
    `)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

// ─── Obtener thread con mensajes ──────────────────────────────
export async function getThread(id: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('request_threads')
    .select(`
      *,
      company:companies(id, name),
      user:users(id, full_name, email),
      thread_messages(*)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ─── Enviar mensaje (como admin) ──────────────────────────────
export async function sendAdminMessage(threadId: string, content: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('thread_messages')
    .insert({ thread_id: threadId, sender_role: 'admin', content })
    .select()
    .single()
  if (error) throw error
  revalidatePath(`/admin/requests/${threadId}`)
  return data
}

// ─── Cambiar estado del thread ────────────────────────────────
export async function updateThreadStatus(id: string, status: ThreadStatus) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('request_threads')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/admin/requests')
  revalidatePath(`/admin/requests/${id}`)
  return data
}
