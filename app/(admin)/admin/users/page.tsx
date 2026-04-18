export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getUsers } from '@/lib/actions/users'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { formatDate } from '@/lib/utils'
import { Users, Mail, Phone, Building2 } from 'lucide-react'

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description={`${users.length} usuario${users.length !== 1 ? 's' : ''} registrado${users.length !== 1 ? 's' : ''}`}
      />

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin usuarios"
          description="Los usuarios se agregan desde Supabase Auth y se vinculan a una empresa."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Usuario</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Empresa</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Rol</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Contacto</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => {
                const company = user.company as { id: string; name: string } | null
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E8F5EE] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-[#1E6B45]">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {company ? (
                        <Link
                          href={`/admin/companies/${company.id}`}
                          className="flex items-center gap-1.5 text-sm text-[#1E6B45] hover:underline"
                        >
                          <Building2 className="w-3.5 h-3.5" /> {company.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-[#E8F5EE] text-[#1E6B45]'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {user.phone ? (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {user.phone}
                        </p>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">{formatDate(user.created_at)}</td>
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
