// lib/constants.ts — Labels y colores para todos los estados del MVP

export const GRABIT_GREEN = '#1E6B45'
export const GRABIT_LIGHT = '#E8F5EE'

// ─── QUOTE ────────────────────────────────────────────────────
export const QUOTE_STATUS_CONFIG = {
  draft:    { label: 'Borrador',   badge: 'bg-gray-100 text-gray-700 border-gray-200' },
  sent:     { label: 'Enviada',    badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  approved: { label: 'Aprobada',   badge: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Rechazada',  badge: 'bg-red-100 text-red-700 border-red-200' },
  expired:  { label: 'Vencida',    badge: 'bg-orange-100 text-orange-700 border-orange-200' },
} as const

// ─── PURCHASE ORDER ───────────────────────────────────────────
export const PO_STATUS_CONFIG = {
  received: { label: 'Recibida',  badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  parsed:   { label: 'Revisada',  badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  accepted: { label: 'Aceptada',  badge: 'bg-green-100 text-green-700 border-green-200' },
} as const

// ─── ORDER ────────────────────────────────────────────────────
export const ORDER_STATUS_CONFIG = {
  created:    { label: 'Creado',        badge: 'bg-gray-100 text-gray-700',    dot: '#9CA3AF', emoji: '📋' },
  purchasing: { label: 'Comprando',     badge: 'bg-blue-100 text-blue-700',    dot: '#3B82F6', emoji: '🛒' },
  in_transit: { label: 'En tránsito',   badge: 'bg-yellow-100 text-yellow-700', dot: '#F59E0B', emoji: '🚚' },
  delivered:  { label: 'Entregado',     badge: 'bg-green-100 text-green-700',  dot: '#10B981', emoji: '✅' },
  issue:      { label: 'Problema',      badge: 'bg-red-100 text-red-700',      dot: '#EF4444', emoji: '⚠️' },
  cancelled:  { label: 'Cancelado',     badge: 'bg-gray-100 text-gray-500',    dot: '#6B7280', emoji: '❌' },
} as const

// ─── ORDER PRODUCT ────────────────────────────────────────────
export const ORDER_PRODUCT_STATUS_CONFIG = {
  pending:   { label: 'Pendiente',   badge: 'bg-gray-100 text-gray-600' },
  purchased: { label: 'Comprado',    badge: 'bg-blue-100 text-blue-700' },
  shipped:   { label: 'Despachado',  badge: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Entregado',   badge: 'bg-green-100 text-green-700' },
  issue:     { label: 'Problema',    badge: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelado',   badge: 'bg-gray-100 text-gray-500' },
} as const

// ─── INVOICE ──────────────────────────────────────────────────
export const INVOICE_STATUS_CONFIG = {
  draft:   { label: 'Borrador', badge: 'bg-gray-100 text-gray-700' },
  issued:  { label: 'Emitida',  badge: 'bg-blue-100 text-blue-700' },
  paid:    { label: 'Pagada',   badge: 'bg-green-100 text-green-700' },
  voided:  { label: 'Anulada',  badge: 'bg-red-100 text-red-700' },
} as const

// ─── THREAD STATUS ────────────────────────────────────────────
export const THREAD_STATUS_CONFIG = {
  open:      { label: 'Abierta',    badge: 'bg-orange-100 text-orange-700' },
  complete:  { label: 'Completada', badge: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelada',  badge: 'bg-gray-100 text-gray-500' },
} as const

// ─── DELIVERY TYPE ────────────────────────────────────────────
export const DELIVERY_TYPE_CONFIG = {
  express: { label: 'Grab It Express', description: 'Despacho directo del comercio' },
  custom:  { label: 'Grab It Custom',  description: 'Despacho personalizado con permisos/remisión' },
} as const

// ─── NAV ITEMS (Admin sidebar) ────────────────────────────────
export const ADMIN_NAV_ITEMS = [
  { href: '/admin',                label: 'Dashboard',          icon: 'LayoutDashboard' },
  { href: '/admin/companies',      label: 'Empresas',            icon: 'Building2' },
  { href: '/admin/users',          label: 'Usuarios',            icon: 'Users' },
  { href: '/admin/requests',       label: 'Solicitudes',         icon: 'MessageSquare' },
  { href: '/admin/quotes',         label: 'Cotizaciones',        icon: 'FileText' },
  { href: '/admin/purchase-orders',label: 'Órdenes de Compra',   icon: 'Inbox' },
  { href: '/admin/orders',         label: 'Pedidos',             icon: 'Package' },
  { href: '/admin/invoices',       label: 'Facturas',            icon: 'Receipt' },
] as const
