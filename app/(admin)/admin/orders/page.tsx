export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getOrders } from '@/lib/actions/orders'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badge'
import { formatDate, shortId } from '@/lib/utils'
import { Package } from 'lucide-react'
import type { OrderStatusCanonical, OrderProductStatus } from '@/lib/types'
import { ORDER_STATUS_CONFIG } from '@/lib/constants'

export default async function OrdersPage() {
  const orders = await getOrders()

  const byStatus = orders.reduce((acc, o) => {
    acc[o.status_canonical] = (acc[o.status_canonical] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <PageHeader
        title="Pedidos"
        description={`${orders.length} pedido${orders.length !== 1 ? 's' : ''}`}
      />

      {/* Resumen por estado */}
      {orders.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {(Object.keys(ORDER_STATUS_CONFIG) as OrderStatusCanonical[]).map((status) => {
            const count = byStatus[status] ?? 0
            if (count === 0) return null
            const cfg = ORDER_STATUS_CONFIG[status]
            return (
              <span key={status} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${cfg.badge}`}>
                {cfg.emoji} {cfg.label} · {count}
              </span>
            )
          })}
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sin pedidos"
          description="Los pedidos se crean cuando una cotización es aprobada y procesada."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">ID</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Empresa</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Productos</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Entrega</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const company  = order.company       as { name: string } | null
                const products = (order.order_products ?? []) as { id: string; name: string; status: string }[]
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-xs font-mono text-[#1E6B45] hover:underline">
                        #{shortId(order.id)}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-800">{company?.name ?? '—'}</td>
                    <td className="px-5 py-3">
                      <StatusBadge type="order" status={order.status_canonical as OrderStatusCanonical} />
                      {order.status_label && (
                        <p className="text-xs text-gray-400 mt-0.5">{order.status_label}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{products.length} ítem{products.length !== 1 ? 's' : ''}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-gray-500 capitalize">{order.delivery_type}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">{formatDate(order.created_at)}</td>
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
