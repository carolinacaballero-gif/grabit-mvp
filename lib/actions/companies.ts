'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import type { CompanyInsert, CompanyUpdate } from '@/lib/types'

function getSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()         { return cookieStore.getAll() },
        setAll()         {},
      },
    }
  )
}

// ─── Listar todas las empresas ────────────────────────────────
export async function getCompanies() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

// ─── Obtener una empresa por ID ───────────────────────────────
export async function getCompany(id: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      users(*),
      quotes(id, status_canonical, total_price, currency, created_at),
      orders(id, status_canonical, created_at)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ─── Crear empresa ────────────────────────────────────────────
export async function createCompany(payload: CompanyInsert) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('companies')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/admin/companies')
  return data
}

// ─── Actualizar empresa ───────────────────────────────────────
export async function updateCompany(id: string, payload: CompanyUpdate) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('companies')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/admin/companies')
  revalidatePath(`/admin/companies/${id}`)
  return data
}

// ─── Eliminar empresa ─────────────────────────────────────────
export async function deleteCompany(id: string) {
  const supabase = getSupabase()
  const { error } = await supabase.from('companies').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/admin/companies')
}
