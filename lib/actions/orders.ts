'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import type { OrderStatusCanonical, OrderInsert, OrderProductInsert } from '@/lib/types'

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

// ─── Listar pedidos ───────────────────────────────────────────
export async function getOrders() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      company:companies(id, name),
      order_products(id, name, status)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ─── Obtener pedido con detalle completo ──────────────────────
export async function getOrder(id: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      company:companies(id, name, contact_name, contact_email),
      order_products(*),
      order_status_events(* , created_by:users(full_name))
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ─── Crear pedido desde cotización aprobada ───────────────────
export async function createOrderFromQuote(quoteId: string, companyId: string) {
  const supabase = getSupabase()

  // Obtener items de la cotización
  const { data: items, error: itemsError } = await supabase
    .from('quote_items')
    .select('*')
    .eq('quote_id', quoteId)
  if (itemsError) throw itemsError

  // Crear el pedido
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      quote_id: quoteId,
      company_id: companyId,
      status_canonical: 'created',
      delivery_type: 'express',
    } as OrderInsert)
    .select()
    .single()
  if (orderError) throw orderError

  // Crear productos del pedido
  if (items && items.length > 0) {
    const products: OrderProductInsert[] = items.map(item => ({
      order_id:            order.id,
      name:                item.product_name,
      quantity:            item.quantity,
      unit_price_client:   item.unit_price,
      unit_cost_purchase:  0,
      shipping_cost:       0,
      tax_cost:            0,
      total_cost:          0,
      status:              'pending',
      product_url:         item.product_url ?? null,
    }))
    await supabase.from('order_products').insert(products)
  }

  // Registrar evento inicial
  await supabase.from('order_status_events').insert({
    order_id:         order.id,
    status_canonical: 'created',
    status_label:     'Pedido creado',
    notes:            'Pedido generado desde cotización aprobada',
  })

  revalidatePath('/admin/orders')
  return order
}

// ─── Actualizar estado del pedido ─────────────────────────────
export async function updateOrderStatus(
  id: string,
  status: OrderStatusCanonical,
  label?: string,
  notes?: string,
  createdBy?: string
) {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('orders')
    .update({
      status_canonical: status,
      status_label:     label ?? null,
      ...(status === 'delivered' ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  // Registrar evento en historial
  await supabase.from('order_status_events').insert({
    order_id:         id,
    status_canonical: status,
    status_label:     label ?? null,
    notes:            notes ?? null,
    created_by:       createdBy ?? null,
  })

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
  return data
}

// ─── Actualizar producto del pedido ──────────────────────────
export async function updateOrderProduct(
  productId: string,
  orderId: string,
  payload: Partial<OrderProductInsert>
) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('order_products')
    .update(payload)
    .eq('id', productId)
    .select()
    .single()
  if (error) throw error
  revalidatePath(`/admin/orders/${orderId}`)
  return data
}
