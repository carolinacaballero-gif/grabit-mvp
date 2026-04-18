'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import type { QuoteInsert, QuoteUpdate, QuoteItemInsert, QuoteStatusCanonical } from '@/lib/types'

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

// ─── Listar cotizaciones ──────────────────────────────────────
export async function getQuotes() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      company:companies(id, name),
      quote_items(id)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ─── Obtener cotización con items ─────────────────────────────
export async function getQuote(id: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      company:companies(id, name, contact_email, contact_name),
      quote_items(*),
      thread:request_threads(id, title, status)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ─── Crear cotización con items ───────────────────────────────
export async function createQuote(
  quote: QuoteInsert,
  items: Omit<QuoteItemInsert, 'quote_id'>[]
) {
  const supabase = getSupabase()

  // 1. Crear la cotización
  const { data: newQuote, error: quoteError } = await supabase
    .from('quotes')
    .insert(quote)
    .select()
    .single()
  if (quoteError) throw quoteError

  // 2. Insertar los items
  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(items.map(item => ({ ...item, quote_id: newQuote.id })))
    if (itemsError) throw itemsError
  }

  // 3. Recalcular total
  await recalcQuoteTotal(newQuote.id)

  revalidatePath('/admin/quotes')
  return newQuote
}

// ─── Actualizar estado de cotización ─────────────────────────
export async function updateQuoteStatus(
  id: string,
  status: QuoteStatusCanonical,
  label?: string,
  reason?: string
) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('quotes')
    .update({
      status_canonical: status,
      status_label:  label  ?? null,
      status_reason: reason ?? null,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/admin/quotes')
  revalidatePath(`/admin/quotes/${id}`)
  return data
}

// ─── Actualizar datos de cotización ──────────────────────────
export async function updateQuote(id: string, payload: QuoteUpdate) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('quotes')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  revalidatePath(`/admin/quotes/${id}`)
  return data
}

// ─── Agregar item a cotización ────────────────────────────────
export async function addQuoteItem(item: QuoteItemInsert) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('quote_items')
    .insert(item)
    .select()
    .single()
  if (error) throw error
  await recalcQuoteTotal(item.quote_id)
  revalidatePath(`/admin/quotes/${item.quote_id}`)
  return data
}

// ─── Eliminar item ────────────────────────────────────────────
export async function deleteQuoteItem(itemId: string, quoteId: string) {
  const supabase = getSupabase()
  const { error } = await supabase.from('quote_items').delete().eq('id', itemId)
  if (error) throw error
  await recalcQuoteTotal(quoteId)
  revalidatePath(`/admin/quotes/${quoteId}`)
}

// ─── Recalcular total ─────────────────────────────────────────
async function recalcQuoteTotal(quoteId: string) {
  const supabase = getSupabase()
  const { data: items } = await supabase
    .from('quote_items')
    .select('subtotal')
    .eq('quote_id', quoteId)

  const total = (items ?? []).reduce((sum, i) => sum + (i.subtotal ?? 0), 0)
  await supabase.from('quotes').update({ total_price: total }).eq('id', quoteId)
}
