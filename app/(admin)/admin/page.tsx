// app/(admin)/admin/page.tsx — Dashboard placeholder
export const dynamic = 'force-dynamic'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { FileText, Package, MessageSquare, Building2 } from 'lucide-react'

async function getStats() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const [quotes, orders, requests, companies] = await Promise.all([
    supabase.from('quotes').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('request_threads').select('id', { count: 'exact', head: true }),
    supabase.from('companies').select('id', { count: 'exact', head: true }),
  ])

  return {
    quotes:    quotes.count    ?? 0,
    orders:    orders.count    ?? 0,
    requests:  requests.count  ?? 0,
    companies: companies.count ?? 0,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Empresas',     value: stats.companies, icon: Building2,     color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Solicitudes',  value: stats.requests,  icon: MessageSquare, color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Cotizaciones', value: stats.quotes,    icon: FileText,      color: 'text-[#1E6B45]',  bg: 'bg-[#E8F5EE]' },
    { label: 'Pedidos',      value: stats.orders,    icon: Package,       color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen general de Grab It</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto mb-4">
          <Package className="w-6 h-6 text-[#1E6B45]" />
        </div>
        <h3 className="font-medium text-gray-900 mb-1">MVP en construcción</h3>
        <p className="text-sm text-gray-500">
          Las secciones de solicitudes, cotizaciones y pedidos estarán disponibles pronto.
        </p>
      </div>
    </div>
  )
}
