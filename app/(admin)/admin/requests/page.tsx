export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getThreads } from '@/lib/actions/requests'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badge'
import { formatDateTime, shortId } from '@/lib/utils'
import { MessageSquare, User } from 'lucide-react'
import type { ThreadStatus } from '@/lib/types'

export default async function RequestsPage() {
  const threads = await getThreads()

  return (
    <div>
      <PageHeader
        title="Solicitudes"
        description={`${threads.length} solicitud${threads.length !== 1 ? 'es' : ''}`}
      />

      {threads.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Sin solicitudes"
          description="Las solicitudes aparecerán cuando los clientes envíen mensajes desde la app."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {threads.map((thread) => {
              const company  = thread.company as { id: string; name: string } | null
              const user     = thread.user    as { full_name: string; email: string } | null
              const messages = (thread.thread_messages ?? []) as { id: string }[]
              return (
                <Link
                  key={thread.id}
                  href={`/admin/requests/${thread.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-[#E8F5EE] flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-[#1E6B45]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-gray-400">#{shortId(thread.id)}</span>
                        <span className="font-medium text-gray-900 text-sm">
                          {thread.title ?? 'Sin título'}
                        </span>
                        <StatusBadge type="thread" status={thread.status as ThreadStatus} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {company && <span>{company.name}</span>}
                        {user && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {user.full_name}
                          </span>
                        )}
                        <span>{messages.length} mensaje{messages.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0 ml-4">
                    {formatDateTime(thread.updated_at)}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
