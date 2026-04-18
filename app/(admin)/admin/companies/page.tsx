export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getCompanies } from '@/lib/actions/companies'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Building2, Plus, MapPin, Mail, Phone } from 'lucide-react'
import { DELIVERY_TYPE_CONFIG } from '@/lib/constants'

export default async function CompaniesPage() {
  const companies = await getCompanies()

  return (
    <div>
      <PageHeader
        title="Empresas"
        description={`${companies.length} empresa${companies.length !== 1 ? 's' : ''} registrada${companies.length !== 1 ? 's' : ''}`}
        action={
          <Link
            href="/admin/companies/new"
            className="flex items-center gap-2 bg-[#1E6B45] hover:bg-[#145233] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva empresa
          </Link>
        }
      />

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Sin empresas registradas"
          description="Crea la primera empresa cliente de Grab It."
          action={
            <Link
              href="/admin/companies/new"
              className="inline-flex items-center gap-2 bg-[#1E6B45] text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" /> Crear empresa
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/admin/companies/${company.id}`}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-[#1E6B45]/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-[#1E6B45]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#1E6B45] transition-colors truncate">
                      {company.name}
                    </h3>
                    {company.ruc_nit && (
                      <p className="text-xs text-gray-400">NIT/RUC: {company.ruc_nit}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
                  {DELIVERY_TYPE_CONFIG[company.delivery_type]?.label ?? company.delivery_type}
                </span>
              </div>

              <div className="space-y-1.5">
                {(company.city || company.country) && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{[company.city, company.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {company.contact_email && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{company.contact_email}</span>
                  </div>
                )}
                {company.contact_phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{company.contact_phone}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
