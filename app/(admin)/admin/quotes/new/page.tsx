'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createQuote } from '@/lib/actions/quotes'
import { getCompanies } from '@/lib/actions/companies'
import { PageHeader } from '@/components/page-header'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import type { Company, QuoteInsert, QuoteItemInsert } from '@/lib/types'

interface ItemRow {
  product_name: string
  product_url:  string
  quantity:     number
  unit_price:   number
  notes:        string
}

const EMPTY_ITEM: ItemRow = {
  product_name: '',
  product_url:  '',
  quantity:     1,
  unit_price:   0,
  notes:        '',
}

export default function NewQuotePage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [form, setForm] = useState<Partial<QuoteInsert>>({
    company_id:       '',
    currency:         'USD',
    status_canonical: 'draft',
    total_price:      0,
    valid_until:      null,
    notes:            null,
  })
  const [items, setItems]     = useState<ItemRow[]>([{ ...EMPTY_ITEM }])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    getCompanies().then(setCompanies).catch(() => {})
  }, [])

  const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)

  function updateItem(index: number, key: keyof ItemRow, value: string | number) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [key]: value } : item))
  }

  function addItem()    { setItems(prev => [...prev, { ...EMPTY_ITEM }]) }
  function removeItem(i: number) { setItems(prev => prev.filter((_, idx) => idx !== i)) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.company_id) { setError('Selecciona una empresa'); return }
    if (items.some(i => !i.product_name)) { setError('Todos los ítems deben tener nombre'); return }

    setLoading(true); setError(null)
    try {
      const quotePayload: QuoteInsert = {
        company_id:       form.company_id!,
        currency:         form.currency ?? 'USD',
        status_canonical: 'draft',
        total_price:      total,
        valid_until:      form.valid_until ?? null,
        notes:            form.notes ?? null,
        thread_id:        null,
        status_label:     null,
        status_reason:    null,
      }
      const itemPayloads: Omit<QuoteItemInsert, 'quote_id'>[] = items.map(i => ({
        product_name: i.product_name,
        product_url:  i.product_url || null,
        quantity:     i.quantity,
        unit_price:   i.unit_price,
        notes:        i.notes || null,
      }))
      const quote = await createQuote(quotePayload, itemPayloads)
      router.push(`/admin/quotes/${quote.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la cotización')
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Nueva cotización"
        action={
          <Link href="/admin/quotes" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">

        {/* Header de la cotización */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Datos generales</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Empresa <span className="text-red-500">*</span></label>
              <select
                value={form.company_id ?? ''}
                onChange={e => setForm(prev => ({ ...prev, company_id: e.target.value }))}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]"
              >
                <option value="">Seleccionar empresa...</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Moneda</label>
              <select
                value={form.currency ?? 'USD'}
                onChange={e => setForm(prev => ({ ...prev, currency: e.target.value as 'USD' | 'COP' }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]"
              >
                <option value="USD">USD</option>
                <option value="COP">COP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Válida hasta</label>
              <input
                type="date"
                value={form.valid_until ?? ''}
                onChange={e => setForm(prev => ({ ...prev, valid_until: e.target.value || null }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas para el cliente</label>
              <input
                value={form.notes ?? ''}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value || null }))}
                placeholder="Incluye información de envío, condiciones, etc."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Productos / Ítems</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 text-sm text-[#1E6B45] hover:text-[#145233] font-medium"
            >
              <Plus className="w-4 h-4" /> Agregar ítem
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-100 rounded-xl p-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 sm:col-span-5">
                    <label className="block text-xs text-gray-500 mb-1">Producto *</label>
                    <input
                      value={item.product_name}
                      onChange={e => updateItem(index, 'product_name', e.target.value)}
                      placeholder="Nombre del producto"
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">Precio unitario ({form.currency})</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unit_price}
                      onChange={e => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-2 flex items-end justify-between sm:justify-end gap-2">
                    <span className="text-sm font-semibold text-gray-900 pb-2">
                      {formatCurrency(item.quantity * item.unit_price, form.currency ?? 'USD')}
                    </span>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)}
                        className="pb-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="col-span-12">
                    <label className="block text-xs text-gray-500 mb-1">URL del producto / Link de referencia</label>
                    <input
                      type="url"
                      value={item.product_url}
                      onChange={e => updateItem(index, 'product_url', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Total cotización</p>
              <p className="text-2xl font-bold text-[#1E6B45]">
                {formatCurrency(total, form.currency ?? 'USD')}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">{error}</div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1E6B45] hover:bg-[#145233] text-white font-medium px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-60"
          >
            {loading ? 'Creando...' : 'Crear cotización'}
          </button>
          <Link href="/admin/quotes" className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
