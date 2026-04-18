'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '@/lib/actions/orders'
import type { OrderStatusCanonical } from '@/lib/types'
import { ORDER_STATUS_CONFIG } from '@/lib/constants'

interface Props {
  orderId:       string
  currentStatus: OrderStatusCanonical
}

const TRANSITIONS: Record<OrderStatusCanonical, OrderStatusCanonical[]> = {
  created:    ['purchasing'],
  purchasing: ['in_transit'],
  in_transit: ['delivered', 'issue'],
  delivered:  [],
  issue:      ['purchasing', 'in_transit', 'cancelled'],
  cancelled:  [],
}

export function OrderStatusChanger({ orderId, currentStatus }: Props) {
  const [open, setOpen]       = useState(false)
  const [target, setTarget]   = useState<OrderStatusCanonical | null>(null)
  const [label, setLabel]     = useState('')
  const [notes, setNotes]     = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const nextStatuses = TRANSITIONS[currentStatus] ?? []
  if (nextStatuses.length === 0) return null

  async function handleChange() {
    if (!target) return
    setLoading(true)
    try {
      await updateOrderStatus(orderId, target, label || undefined, notes || undefined)
      setOpen(false); setTarget(null); setLabel(''); setNotes('')
      router.refresh()
    } catch {
      alert('Error al actualizar el estado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-400 mb-3">Avanzar estado</p>
      <div className="space-y-2">
        {nextStatuses.map((status) => {
          const cfg = ORDER_STATUS_CONFIG[status]
          return (
            <button
              key={status}
              onClick={() => { setTarget(status); setOpen(true) }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${cfg.badge} hover:opacity-80`}
            >
              {cfg.emoji} → {cfg.label}
            </button>
          )
        })}
      </div>

      {open && target && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-semibold text-gray-900 mb-1">
              {ORDER_STATUS_CONFIG[target].emoji} Cambiar a &ldquo;{ORDER_STATUS_CONFIG[target].label}&rdquo;
            </h3>
            <p className="text-sm text-gray-500 mb-4">Agrega detalles para el historial de tracking.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Etiqueta de tracking (visible al cliente)</label>
                <input
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="ej. En aduana Panamá"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notas internas</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="ej. Contactar al cliente para coordinar entrega"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleChange}
                disabled={loading}
                className="flex-1 bg-[#1E6B45] hover:bg-[#145233] text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-60"
              >
                {loading ? 'Guardando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => { setOpen(false); setTarget(null) }}
                className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
