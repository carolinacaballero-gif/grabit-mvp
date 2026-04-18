'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendAdminMessage, updateThreadStatus } from '@/lib/actions/requests'
import type { ThreadStatus } from '@/lib/types'
import { Send, CheckCircle, XCircle } from 'lucide-react'

interface Props {
  threadId: string
  status:   ThreadStatus
}

export function ThreadChat({ threadId, status }: Props) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const router = useRouter()

  async function handleSend() {
    if (!message.trim()) return
    setSending(true)
    try {
      await sendAdminMessage(threadId, message.trim())
      setMessage('')
      router.refresh()
    } catch {
      alert('Error al enviar mensaje')
    } finally {
      setSending(false)
    }
  }

  async function handleStatusChange(newStatus: ThreadStatus) {
    try {
      await updateThreadStatus(threadId, newStatus)
      router.refresh()
    } catch {
      alert('Error al cambiar estado')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-100 p-4">
      {/* Estado actions */}
      {status === 'open' && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => handleStatusChange('complete')}
            className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Marcar completa
          </button>
          <button
            onClick={() => handleStatusChange('cancelled')}
            className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" /> Cancelar
          </button>
        </div>
      )}

      {status !== 'open' ? (
        <p className="text-xs text-center text-gray-400 py-2">
          Esta solicitud está {status === 'complete' ? 'completada' : 'cancelada'}.
          {' '}
          <button
            onClick={() => handleStatusChange('open')}
            className="text-[#1E6B45] hover:underline"
          >
            Reabrir
          </button>
        </p>
      ) : (
        <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#1E6B45] focus-within:ring-2 focus-within:ring-[#1E6B45]/20 transition-all">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Escribe una respuesta... (Enter para enviar)"
            className="flex-1 bg-transparent text-sm text-gray-900 resize-none focus:outline-none placeholder:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="flex-shrink-0 w-9 h-9 bg-[#1E6B45] hover:bg-[#145233] rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
    </div>
  )
}
