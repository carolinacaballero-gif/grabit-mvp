'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { LogOut } from 'lucide-react'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - historial de cotizaciones y pedidos */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100">
        <div className="px-5 py-5 border-b border-gray-100">
          <span className="text-2xl font-bold text-[#1E6B45]">GrabIT.</span>
        </div>

        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Mis Solicitudes
          </p>
          {/* Historial de threads — se popula en Sesión 3 */}
          <div className="space-y-1">
            <p className="px-3 py-2 text-sm text-gray-400 italic">
              Aún no tienes solicitudes.
            </p>
          </div>
        </div>

        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
