'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createCompany } from '@/lib/actions/companies'
import { PageHeader } from '@/components/page-header'
import { ArrowLeft } from 'lucide-react'
import type { CompanyInsert } from '@/lib/types'

const INITIAL: CompanyInsert = {
  name:           '',
  ruc_nit:        null,
  address:        null,
  city:           null,
  country:        null,
  delivery_type:  'express',
  payment_terms:  null,
  contact_name:   null,
  contact_email:  null,
  contact_phone:  null,
  notes:          null,
}

export default function NewCompanyPage() {
  const [form, setForm]       = useState<CompanyInsert>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const router = useRouter()

  function set(key: keyof CompanyInsert, value: string) {
    setForm(prev => ({ ...prev, [key]: value || null }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const company = await createCompany(form)
      router.push(`/admin/companies/${company.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la empresa')
      setLoading(false)
    }
  }

  const Field = ({
    label, field, type = 'text', placeholder, required
  }: {
    label: string
    field: keyof CompanyInsert
    type?: string
    placeholder?: string
    required?: boolean
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={(form[field] as string) ?? ''}
        onChange={(e) => set(field, e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45] focus:border-transparent transition"
      />
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Nueva empresa"
        description="Registra un cliente de Grab It"
        action={
          <Link
            href="/admin/companies"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

          {/* Información básica */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Información básica</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Nombre de la empresa" field="name" placeholder="Empresa S.A.S." required />
              </div>
              <Field label="NIT / RUC" field="ruc_nit" placeholder="900123456-1" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tipo de entrega
                </label>
                <select
                  value={form.delivery_type}
                  onChange={(e) => set('delivery_type', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45] focus:border-transparent"
                >
                  <option value="express">Grab It Express</option>
                  <option value="custom">Grab It Custom</option>
                </select>
              </div>
              <Field label="Términos de pago" field="payment_terms" placeholder="30 días neto" />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Ubicación */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Ubicación</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Dirección" field="address" placeholder="Cra 7 # 45-32" />
              </div>
              <Field label="Ciudad" field="city" placeholder="Bogotá" />
              <Field label="País" field="country" placeholder="Colombia" />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Contacto principal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre del contacto" field="contact_name" placeholder="Juan Pérez" />
              <Field label="Teléfono" field="contact_phone" placeholder="+57 300 000 0000" />
              <div className="sm:col-span-2">
                <Field label="Email de contacto" field="contact_email" type="email" placeholder="juan@empresa.com" />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas internas</label>
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Instrucciones especiales, condiciones, etc."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45] focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            type="submit"
            disabled={loading || !form.name}
            className="bg-[#1E6B45] hover:bg-[#145233] text-white font-medium px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Crear empresa'}
          </button>
          <Link
            href="/admin/companies"
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
