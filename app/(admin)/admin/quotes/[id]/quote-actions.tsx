'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateQuoteStatus } from '@/lib/actions/quotes'
import type { QuoteStatusCanonical } from '@/lib/types'
import { QUOTE_STATUS_CONFIG } from '@/lib/constants'
import { ChevronDown } from 'lucide-react'

interface Props {
  quoteId:       string
  currentStatus: QuoteStatusCanonical
}

const TRANSITIONS: Record<QuoteStatusCanonical, QuoteStatusCanonical[]> = {
  draft:    ['sent'],
  sent:     ['approved', 'rejected'],
  approved: ['expired'],
  rejected: ['draft'],
  expired:  ['draft'],
}

export function QuoteActions({ quoteId, currentStatus }: Props) {
  const [open, setOpen]       = useState(false)
  const [label, setLabel]     = useState('')
  const [reason, setReason]   = useState('')
  const [target, setTarget]   = useState<QuoteStatusCanonical | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const nextStatuses = TRANSITIONS[currentStatus] ?? []

  async function handleChange() {
    if (!target) return
    setLoading(true)
    try {
      await updateQuoteStatus(quoteId, target, label || undefined, reason || undefined)
      setOpen(false)
      router.refresh()
    } catch {
      alert('Error al cambiar estado')
    } finally {
      setLoading(false)
    }
  }

  if (nextStatuses.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-400 mb-3">Cambiar estado</p>

      <div className="space-y-2">
        {nextStatuses.map((status) => {
          const cfg = QUOTE_STATUS_CONFIG[status]
          return (
            <button
              key={status}
              onClick={() => { setTarget(status); setOpen(true) }}
              className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-medium transition-all ${cfg.badge} hover:opacity-80`}
            >
              → Marcar como {cfg.label}
            </button>
          )
        })}
      </div>

      {/* Modal de confirmación */}
      {open && target && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-semibold text-gray-900 mb-1">
              Cambiar a &ldquo;{QUOTE_STATUS_CONFIG[target].label}&rdquo;
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Puedes agregar una etiqueta y razón opcionales.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Etiqueta visible (opcional)</label>
                <input
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="ej. Pendiente aprobación interna"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Razón interna (opcional)</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={2}
                  placeholder="ej. Cliente solicitó descuento adicional"
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
                onClick={() => { setOpen(false); setTarget(null); setLabel(''); setReason('') }}
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
