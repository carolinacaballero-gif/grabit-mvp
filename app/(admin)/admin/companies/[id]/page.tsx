export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompany } from '@/lib/actions/companies'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { formatCurrency, formatDate, shortId } from '@/lib/utils'
import { DELIVERY_TYPE_CONFIG } from '@/lib/constants'
import {
  ArrowLeft, Building2, MapPin, Mail, Phone, User,
  FileText, Package, Edit,
} from 'lucide-react'

export default async function CompanyDetailPage({
  params,
}: {
  params: { id: string }
}) {
  let company
  try {
    company = await getCompany(params.id)
  } catch {
    notFound()
  }

  const quotes = (company.quotes ?? []) as Array<{
    id: string; status_canonical: string; total_price: number; currency: string; created_at: string
  }>
  const orders = (company.orders ?? []) as Array<{
    id: string; status_canonical: string; created_at: string
  }>
  const users  = (company.users  ?? []) as Array<{
    id: string; full_name: string; email: string; role: string
  }>

  return (
    <div>
      <PageHeader
        title={company.name}
        description={`NIT/RUC: ${company.ruc_nit ?? '—'}`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/companies"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
            <Link
              href={`/admin/companies/${company.id}/edit`}
              className="flex items-center gap-2 bg-[#1E6B45] hover:bg-[#145233] text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              <Edit className="w-4 h-4" /> Editar
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Info card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#1E6B45]" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{company.name}</h2>
                <span className="text-xs text-gray-400">
                  {DELIVERY_TYPE_CONFIG[company.delivery_type]?.label}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {(company.city || company.country) && (
                <Row icon={MapPin}>
                  {[company.city, company.country].filter(Boolean).join(', ')}
                </Row>
              )}
              {company.address && <Row icon={MapPin}>{company.address}</Row>}
              {company.contact_name && <Row icon={User}>{company.contact_name}</Row>}
              {company.contact_email && <Row icon={Mail}>{company.contact_email}</Row>}
              {company.contact_phone && <Row icon={Phone}>{company.contact_phone}</Row>}
            </div>

            {company.payment_terms && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Términos de pago</p>
                <p className="text-sm text-gray-700">{company.payment_terms}</p>
              </div>
            )}

            {company.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Notas</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{company.notes}</p>
              </div>
            )}
          </div>

          {/* Usuarios */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> Usuarios ({users.length})
            </h3>
            {users.length === 0 ? (
              <p className="text-sm text-gray-400">Sin usuarios registrados</p>
            ) : (
              <div className="space-y-2">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.full_name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cotizaciones y Pedidos */}
        <div className="lg:col-span-2 space-y-6">

          {/* Cotizaciones */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Cotizaciones ({quotes.length})
              </h3>
              <Link
                href={`/admin/quotes?company=${company.id}`}
                className="text-xs text-[#1E6B45] hover:underline"
              >
                Ver todas →
              </Link>
            </div>
            {quotes.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">Sin cotizaciones</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {quotes.slice(0, 5).map((q) => (
                  <Link
                    key={q.id}
                    href={`/admin/quotes/${q.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 font-mono">#{shortId(q.id)}</span>
                      <StatusBadge type="quote" status={q.status_canonical as 'draft'} />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(q.total_price, q.currency)}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(q.created_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pedidos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4" /> Pedidos ({orders.length})
              </h3>
              <Link
                href={`/admin/orders?company=${company.id}`}
                className="text-xs text-[#1E6B45] hover:underline"
              >
                Ver todos →
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">Sin pedidos</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((o) => (
                  <Link
                    key={o.id}
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 font-mono">#{shortId(o.id)}</span>
                      <StatusBadge type="order" status={o.status_canonical as 'created'} />
                    </div>
                    <p className="text-xs text-gray-400">{formatDate(o.created_at)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <span className="truncate">{children}</span>
    </div>
  )
}
