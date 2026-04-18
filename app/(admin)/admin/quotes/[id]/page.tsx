export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getQuote } from '@/lib/actions/quotes'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { QuoteActions } from './quote-actions'
import { formatCurrency, formatDate, shortId, daysUntil } from '@/lib/utils'
import { ArrowLeft, ExternalLink, Calendar, Building2 } from 'lucide-react'
import type { QuoteStatusCanonical, QuoteItem } from '@/lib/types'

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  let quote
  try {
    quote = await getQuote(params.id)
  } catch {
    notFound()
  }

  const company   = quote.company   as { name: string; contact_email: string; contact_name: string } | null
  const items     = (quote.quote_items ?? []) as QuoteItem[]
  const thread    = quote.thread    as { id: string; title: string } | null
  const daysLeft  = quote.valid_until ? daysUntil(quote.valid_until) : null

  return (
    <div>
      <PageHeader
        title={`Cotización #${shortId(quote.id)}`}
        description={company?.name ?? ''}
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/quotes" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Panel lateral */}
        <div className="lg:col-span-1 space-y-4">

          {/* Estado */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 mb-2">Estado actual</p>
            <StatusBadge type="quote" status={quote.status_canonical as QuoteStatusCanonical} />
            {quote.status_label && (
              <p className="text-sm text-gray-600 mt-2">{quote.status_label}</p>
            )}
            {quote.status_reason && (
              <p className="text-xs text-gray-400 mt-1">{quote.status_reason}</p>
            )}
          </div>

          {/* Acciones */}
          <QuoteActions
            quoteId={quote.id}
            currentStatus={quote.status_canonical as QuoteStatusCanonical}
          />

          {/* Info general */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            {company && (
              <Row label="Empresa">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span>{company.name}</span>
                </div>
              </Row>
            )}
            <Row label="Moneda">{quote.currency}</Row>
            <Row label="Creada">{formatDate(quote.created_at)}</Row>
            {quote.valid_until && (
              <Row label="Vence">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{formatDate(quote.valid_until)}</span>
                  {daysLeft !== null && (
                    <span className={`text-xs ${daysLeft < 0 ? 'text-red-500' : daysLeft < 5 ? 'text-orange-500' : 'text-gray-400'}`}>
                      ({daysLeft < 0 ? `Vencida hace ${Math.abs(daysLeft)}d` : `${daysLeft}d`})
                    </span>
                  )}
                </div>
              </Row>
            )}
            {thread && (
              <Row label="Solicitud">
                <Link href={`/admin/requests/${thread.id}`} className="text-[#1E6B45] hover:underline text-xs">
                  #{shortId(thread.id)} {thread.title ?? ''}
                </Link>
              </Row>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Productos ({items.length})
              </h3>
            </div>

            {items.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-400">Sin productos</p>
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Producto</th>
                      <th className="text-center text-xs font-medium text-gray-400 px-3 py-3">Cant.</th>
                      <th className="text-right text-xs font-medium text-gray-400 px-3 py-3">P. Unit.</th>
                      <th className="text-right text-xs font-medium text-gray-400 px-5 py-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                          {item.product_url && (
                            <a
                              href={item.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-[#1E6B45] hover:underline mt-0.5"
                            >
                              <ExternalLink className="w-3 h-3" /> Ver producto
                            </a>
                          )}
                          {item.notes && (
                            <p className="text-xs text-gray-400 mt-0.5">{item.notes}</p>
                          )}
                        </td>
                        <td className="px-3 py-4 text-center text-sm text-gray-700">{item.quantity}</td>
                        <td className="px-3 py-4 text-right text-sm text-gray-700">
                          {formatCurrency(item.unit_price, quote.currency)}
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(item.subtotal, quote.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Total */}
                <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">Total</p>
                    <p className="text-2xl font-bold text-[#1E6B45]">
                      {formatCurrency(quote.total_price, quote.currency)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notas */}
          {quote.notes && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 mb-2">Notas</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{quote.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  )
}
