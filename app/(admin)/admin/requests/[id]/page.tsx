export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getThread } from '@/lib/actions/requests'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { ThreadChat } from './thread-chat'
import { formatDateTime, shortId } from '@/lib/utils'
import { ArrowLeft, Building2, User } from 'lucide-react'
import type { ThreadStatus, ThreadMessage } from '@/lib/types'

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  let thread
  try {
    thread = await getThread(params.id)
  } catch {
    notFound()
  }

  const company  = thread.company as { id: string; name: string } | null
  const user     = thread.user    as { full_name: string; email: string } | null
  const messages = (thread.thread_messages ?? []) as ThreadMessage[]

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4">
        <PageHeader
          title={thread.title ?? `Solicitud #${shortId(thread.id)}`}
          action={
            <div className="flex items-center gap-3">
              <StatusBadge type="thread" status={thread.status as ThreadStatus} />
              <Link href="/admin/requests" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4" /> Volver
              </Link>
            </div>
          }
        />
        <div className="flex items-center gap-4 text-xs text-gray-400">
          {company && (
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              <Link href={`/admin/companies/${company.id}`} className="hover:text-[#1E6B45] hover:underline">
                {company.name}
              </Link>
            </span>
          )}
          {user && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> {user.full_name} · {user.email}
            </span>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {sortedMessages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin mensajes aún</p>
          ) : (
            sortedMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.sender_role === 'admin'
                    ? 'bg-[#1E6B45] text-white'
                    : msg.sender_role === 'system'
                    ? 'bg-gray-100 text-gray-600 text-xs italic'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.sender_role === 'admin' ? 'text-white/60' : 'text-gray-400'}`}>
                    {formatDateTime(msg.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input de respuesta */}
        <ThreadChat threadId={thread.id} status={thread.status as ThreadStatus} />
      </div>
    </div>
  )
}
