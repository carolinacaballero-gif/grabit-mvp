export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badge'
import { formatDate, shortId } from '@/lib/utils'
import { Inbox } from 'lucide-react'
import type { POStatus } from '@/lib/types'

async function getPurchaseOrders() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`*, company:companies(id, name), quote:quotes(id, total_price, currency)`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export default async function PurchaseOrdersPage() {
  const pos = await getPurchaseOrders()

  return (
    <div>
      <PageHeader
        title="Órdenes de Compra"
        description={`${pos.length} orden${pos.length !== 1 ? 'es' : ''}`}
      />

      {pos.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Sin órdenes de compra"
          description="Las órdenes de compra se reciben cuando un cliente aprueba una cotización."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">ID</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Empresa</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">PO Nº Cliente</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Cotización</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pos.map((po) => {
                const company = po.company as { name: string } | null
                const quote   = po.quote   as { id: string; total_price: number; currency: string } | null
                return (
                  <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-xs font-mono text-gray-500">#{shortId(po.id)}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-800">{company?.name ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-gray-700">{po.client_po_number ?? '—'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge type="po" status={po.status as POStatus} />
                    </td>
                    <td className="px-5 py-3">
                      {quote ? (
                        <Link href={`/admin/quotes/${quote.id}`} className="text-xs text-[#1E6B45] hover:underline">
                          #{shortId(quote.id)}
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">{formatDate(po.created_at)}</td>
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
