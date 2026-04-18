export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getQuotes } from '@/lib/actions/quotes'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badge'
import { formatCurrency, formatDate, shortId } from '@/lib/utils'
import { FileText, Plus, Calendar } from 'lucide-react'
import type { QuoteStatusCanonical } from '@/lib/types'
import { QUOTE_STATUS_CONFIG } from '@/lib/constants'

export default async function QuotesPage() {
  const quotes = await getQuotes()

  // Agrupar por estado para el resumen
  const byStatus = quotes.reduce((acc, q) => {
    acc[q.status_canonical] = (acc[q.status_canonical] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <PageHeader
        title="Cotizaciones"
        description={`${quotes.length} cotización${quotes.length !== 1 ? 'es' : ''}`}
        action={
          <Link
            href="/admin/quotes/new"
            className="flex items-center gap-2 bg-[#1E6B45] hover:bg-[#145233] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Nueva cotización
          </Link>
        }
      />

      {/* Resumen por estado */}
      {quotes.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {(Object.keys(QUOTE_STATUS_CONFIG) as QuoteStatusCanonical[]).map((status) => {
            const count = byStatus[status] ?? 0
            if (count === 0) return null
            const cfg = QUOTE_STATUS_CONFIG[status]
            return (
              <span key={status} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${cfg.badge}`}>
                {cfg.label} · {count}
              </span>
            )
          })}
        </div>
      )}

      {quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Sin cotizaciones"
          description="Crea la primera cotización para un cliente."
          action={
            <Link href="/admin/quotes/new" className="inline-flex items-center gap-2 bg-[#1E6B45] text-white text-sm font-medium px-4 py-2 rounded-lg">
              <Plus className="w-4 h-4" /> Crear cotización
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">ID</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Empresa</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Items</th>
                <th className="text-right text-xs font-medium text-gray-400 px-5 py-3">Total</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Vence</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {quotes.map((q) => {
                const company = q.company as { name: string } | null
                const items   = q.quote_items as { id: string }[]
                return (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/admin/quotes/${q.id}`} className="text-xs font-mono text-[#1E6B45] hover:underline">
                        #{shortId(q.id)}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-800">{company?.name ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge type="quote" status={q.status_canonical as QuoteStatusCanonical} />
                      {q.status_label && (
                        <p className="text-xs text-gray-400 mt-0.5">{q.status_label}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{items.length}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(q.total_price, q.currency)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {q.valid_until ? (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(q.valid_until)}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">{formatDate(q.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
