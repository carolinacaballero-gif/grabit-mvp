'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getCompany, updateCompany } from '@/lib/actions/companies'
import { PageHeader } from '@/components/page-header'
import { ArrowLeft } from 'lucide-react'
import type { Company } from '@/lib/types'

export default function EditCompanyPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [form, setForm]       = useState<Partial<Company> | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getCompany(id)
      .then(setForm)
      .catch(() => setError('No se pudo cargar la empresa'))
      .finally(() => setLoading(false))
  }, [id])

  function set(key: keyof Company, value: string) {
    setForm(prev => prev ? { ...prev, [key]: value || null } : prev)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setError(null)
    try {
      await updateCompany(id, {
        name:          form.name,
        ruc_nit:       form.ruc_nit,
        address:       form.address,
        city:          form.city,
        country:       form.country,
        delivery_type: form.delivery_type,
        payment_terms: form.payment_terms,
        contact_name:  form.contact_name,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        notes:         form.notes,
      })
      router.push(`/admin/companies/${id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
      setSaving(false)
    }
  }

  if (loading) return <div className="text-sm text-gray-400 py-12 text-center">Cargando...</div>
  if (!form)   return <div className="text-sm text-red-500 py-12 text-center">{error}</div>

  return (
    <div>
      <PageHeader
        title="Editar empresa"
        action={
          <Link href={`/admin/companies/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Información básica</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre <span className="text-red-500">*</span></label>
                <input value={form.name ?? ''} onChange={e => set('name', e.target.value)} required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">NIT / RUC</label>
                <input value={form.ruc_nit ?? ''} onChange={e => set('ruc_nit', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de entrega</label>
                <select value={form.delivery_type ?? 'express'} onChange={e => set('delivery_type', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]">
                  <option value="express">Grab It Express</option>
                  <option value="custom">Grab It Custom</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Términos de pago</label>
                <input value={form.payment_terms ?? ''} onChange={e => set('payment_terms', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]" />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Ubicación</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección</label>
                <input value={form.address ?? ''} onChange={e => set('address', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad</label>
                <input value={form.city ?? ''} onChange={e => set('city', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">País</label>
                <input value={form.country ?? ''} onChange={e => set('country', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]" />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Contacto principal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
                <input value={form.contact_name ?? ''} onChange={e => set('contact_name', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                <input value={form.contact_phone ?? ''} onChange={e => set('contact_phone', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={form.contact_email ?? ''} onChange={e => set('contact_email', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45]" />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          <section>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas internas</label>
            <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B45] resize-none" />
          </section>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">{error}</div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button type="submit" disabled={saving}
            className="bg-[#1E6B45] hover:bg-[#145233] text-white font-medium px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-60">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <Link href={`/admin/companies/${id}`} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
