// app/(client)/client/page.tsx — Interfaz principal del cliente (chat de cotización)
export const dynamic = 'force-dynamic'

import { Send } from 'lucide-react'

export default function ClientPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        {/* Welcome message */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1E6B45] mb-2">GrabIT.</h1>
            <p className="text-gray-500 text-sm">Tu agente de compras B2B para Latam</p>
          </div>

          {/* System message */}
          <div className="bg-[#E8F5EE] rounded-2xl p-5 mb-6">
            <p className="text-sm text-[#1E6B45] font-medium mb-1">Hola 👋</p>
            <p className="text-sm text-gray-700">
              Soy tu asistente de compras Grab It. Puedo ayudarte a cotizar
              cualquier producto de cualquier tienda online. Solo comparte el
              nombre del producto o el enlace y te envío una cotización.
            </p>
          </div>

          {/* Example prompts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {[
              'Necesito 10 sillas ergonómicas para oficina',
              'Quiero cotizar laptops Dell XPS 15 × 5 unidades',
              'Busco impresoras HP LaserJet para mi empresa',
              'Necesito 20 monitores 27" curved',
            ].map((prompt) => (
              <button
                key={prompt}
                className="text-left px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-[#1E6B45] hover:text-[#1E6B45] transition-colors bg-white"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 bg-white px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-[#1E6B45] focus-within:ring-2 focus-within:ring-[#1E6B45]/20 transition-all">
            <textarea
              rows={1}
              placeholder="Escribe qué necesitas cotizar..."
              className="flex-1 bg-transparent text-sm text-gray-900 resize-none focus:outline-none placeholder:text-gray-400"
            />
            <button className="flex-shrink-0 w-9 h-9 bg-[#1E6B45] hover:bg-[#145233] rounded-xl flex items-center justify-center transition-colors">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Grab It revisa tu solicitud y te envía una cotización por correo.
          </p>
        </div>
      </div>
    </div>
  )
}
