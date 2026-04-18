export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrder } from '@/lib/actions/orders'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { OrderStatusChanger } from './order-status-changer'
import { formatDate, formatDateTime, formatCurrency, shortId } from '@/lib/utils'
import { ArrowLeft, Building2, ExternalLink, Clock } from 'lucide-react'
import type { OrderStatusCanonical, OrderProductStatus, OrderStatusEvent } from '@/lib/types'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  let order
  try {
    order = await getOrder(params.id)
  } catch {
    notFound()
  }

  const company  = order.company as { name: string; contact_name: string; contact_email: string } | null
  const products = (order.order_products ?? []) as Array<{
    id: string; name: string; quantity: number; unit_price_client: number;
    shipping_cost: number; status: string; tracking_number: string | null;
    product_url: string | null; notes: string | null; delivered_at: string | null
  }>
  const events   = (order.order_status_events ?? []) as Array<OrderStatusEvent & {
    created_by: { full_name: string } | null
  }>

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div>
      <PageHeader
        title={`Pedido #${shortId(order.id)}`}
        description={company?.name ?? ''}
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/orders" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Panel lateral */}
        <div className="lg:col-span-1 space-y-4">
          {/* Estado actual */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 mb-2">Estado</p>
            <StatusBadge type="order" status={order.status_canonical as OrderStatusCanonical} />
            {order.status_label && <p className="text-sm text-gray-600 mt-2">{order.status_label}</p>}
          </div>

          {/* Cambiar estado */}
          <OrderStatusChanger orderId={order.id} currentStatus={order.status_canonical as OrderStatusCanonical} />

          {/* Datos del pedido */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            {company && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Empresa</p>
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  {company.name}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Tipo de entrega</p>
              <p className="text-sm text-gray-700 capitalize">{order.delivery_type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Creado</p>
              <p className="text-sm text-gray-700">{formatDate(order.created_at)}</p>
            </div>
            {order.completed_at && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Completado</p>
                <p className="text-sm text-gray-700">{formatDate(order.completed_at)}</p>
              </div>
            )}
            {order.quote_id && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Cotización origen</p>
                <Link href={`/admin/quotes/${order.quote_id}`} className="text-xs text-[#1E6B45] hover:underline">
                  #{shortId(order.quote_id)}
                </Link>
              </div>
            )}
          </div>

          {/* Historial de eventos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" /> Historial
            </h3>
            {sortedEvents.length === 0 ? (
              <p className="text-xs text-gray-400">Sin eventos</p>
            ) : (
              <div className="space-y-3">
                {sortedEvents.map((ev) => (
                  <div key={ev.id} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1E6B45] mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-800">
                        {ev.status_label ?? ev.status_canonical}
                      </p>
                      {ev.notes && <p className="text-xs text-gray-500">{ev.notes}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDateTime(ev.created_at)}
                        {ev.created_by && ` · ${(ev.created_by as { full_name: string }).full_name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Productos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Productos ({products.length})</h3>
            </div>

            {products.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-400">Sin productos</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {products.map((p) => (
                  <div key={p.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm text-gray-900">{p.name}</p>
                          <StatusBadge type="order_product" status={p.status as OrderProductStatus} />
                        </div>
                        <p className="text-xs text-gray-500">
                          {p.quantity} × {formatCurrency(p.unit_price_client, 'USD')}
                        </p>
                        {p.tracking_number && (
                          <p className="text-xs text-[#1E6B45] mt-1">
                            Tracking: <span className="font-mono">{p.tracking_number}</span>
                          </p>
                        )}
                        {p.notes && <p className="text-xs text-gray-400 mt-1">{p.notes}</p>}
                        {p.delivered_at && (
                          <p className="text-xs text-green-600 mt-1">
                            Entregado: {formatDateTime(p.delivered_at)}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-sm text-gray-900">
                          {formatCurrency(p.quantity * p.unit_price_client, 'USD')}
                        </p>
                        {p.product_url && (
                          <a
                            href={p.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-[#1E6B45] hover:underline mt-1 justify-end"
                          >
                            <ExternalLink className="w-3 h-3" /> Ver
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
