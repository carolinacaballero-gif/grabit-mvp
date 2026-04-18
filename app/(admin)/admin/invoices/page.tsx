export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badge'
import { formatCurrency, formatDate, shortId } from '@/lib/utils'
import { Receipt } from 'lucide-react'
import type { InvoiceStatus } from '@/lib/types'

async function getInvoices() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data, error } = await supabase
    .from('invoices')
    .select(`*, company:companies(id, name), order:orders(id)`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return (
    <div>
      <PageHeader
        title="Facturas"
        description={`${invoices.length} factura${invoices.length !== 1 ? 's' : ''}`}
      />

      {invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Sin facturas"
          description="Las facturas se generan desde los pedidos completados."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Nº Factura</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Empresa</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Estado</th>
                <th className="text-right text-xs font-medium text-gray-400 px-5 py-3">Total</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Emitida</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Vence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => {
                const company = inv.company as { name: string } | null
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {inv.invoice_number ?? `#${shortId(inv.id)}`}
                      </p>
                      <Link
                        href={`/admin/orders/${(inv.order as { id: string } | null)?.id}`}
                        className="text-xs text-[#1E6B45] hover:underline"
                      >
                        Ver pedido →
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-800">{company?.name ?? '—'}</td>
                    <td className="px-5 py-3">
                      <StatusBadge type="invoice" status={inv.status as InvoiceStatus} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(inv.total_billed, 'USD')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {inv.issued_at ? formatDate(inv.issued_at) : '—'}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {inv.due_at ? formatDate(inv.due_at) : '—'}
                    </td>
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
