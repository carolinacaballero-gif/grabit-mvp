// lib/types.ts — Tipos TypeScript del schema completo de Grab It MVP

// ─── ENUMS ────────────────────────────────────────────────────

export type DeliveryType          = 'express' | 'custom'
export type UserRole               = 'admin' | 'client'
export type ThreadStatus           = 'open' | 'complete' | 'cancelled'
export type SenderRole             = 'client' | 'admin' | 'system'
export type QuoteStatusCanonical   = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
export type POStatus               = 'received' | 'parsed' | 'accepted'
export type OrderStatusCanonical   = 'created' | 'purchasing' | 'in_transit' | 'delivered' | 'issue' | 'cancelled'
export type OrderProductStatus     = 'pending' | 'purchased' | 'shipped' | 'delivered' | 'issue' | 'cancelled'
export type InvoiceStatus          = 'draft' | 'issued' | 'paid' | 'voided'
export type Currency               = 'USD' | 'COP'

// ─── ENTIDADES BASE ───────────────────────────────────────────

export interface Company {
  id:             string
  name:           string
  ruc_nit:        string | null
  address:        string | null
  city:           string | null
  country:        string | null
  delivery_type:  DeliveryType
  payment_terms:  string | null
  contact_name:   string | null
  contact_email:  string | null
  contact_phone:  string | null
  notes:          string | null
  created_at:     string
  updated_at:     string
}

export interface User {
  id:          string
  company_id:  string
  email:       string
  full_name:   string
  role:        UserRole
  phone:       string | null
  created_at:  string
  updated_at:  string
}

export interface RequestThread {
  id:          string
  company_id:  string
  user_id:     string
  title:       string | null
  status:      ThreadStatus
  created_at:  string
  updated_at:  string
}

export interface ThreadMessage {
  id:           string
  thread_id:    string
  sender_role:  SenderRole
  content:      string
  created_at:   string
}

export interface Quote {
  id:               string
  thread_id:        string | null
  company_id:       string
  status_canonical: QuoteStatusCanonical
  status_label:     string | null
  status_reason:    string | null
  currency:         Currency
  total_price:      number
  valid_until:      string | null
  notes:            string | null
  created_at:       string
  updated_at:       string
}

export interface QuoteItem {
  id:            string
  quote_id:      string
  product_name:  string
  product_url:   string | null
  quantity:      number
  unit_price:    number
  subtotal:      number   // columna generada en DB
  notes:         string | null
  created_at:    string
}

export interface PurchaseOrder {
  id:               string
  quote_id:         string
  company_id:       string
  client_po_number: string | null
  status:           POStatus
  po_pdf_url:       string | null
  notes:            string | null
  created_at:       string
  updated_at:       string
}

export interface Order {
  id:               string
  quote_id:         string | null
  po_id:            string | null
  company_id:       string
  status_canonical: OrderStatusCanonical
  status_label:     string | null
  status_reason:    string | null
  delivery_type:    DeliveryType
  notes:            string | null
  completed_at:     string | null
  created_at:       string
  updated_at:       string
}

export interface OrderProduct {
  id:                  string
  order_id:            string
  name:                string
  quantity:            number
  unit_price_client:   number
  unit_cost_purchase:  number
  shipping_cost:       number
  tax_cost:            number
  total_cost:          number
  status:              OrderProductStatus
  tracking_number:     string | null
  product_url:         string | null
  notes:               string | null
  delivered_at:        string | null
  created_at:          string
  updated_at:          string
}

export interface OrderStatusEvent {
  id:               string
  order_id:         string
  status_canonical: string | null
  status_label:     string | null
  notes:            string | null
  created_by:       string | null
  created_at:       string
}

export interface Invoice {
  id:              string
  order_id:        string
  company_id:      string
  status:          InvoiceStatus
  total_billed:    number
  invoice_number:  string | null
  issued_at:       string | null
  due_at:          string | null
  paid_at:         string | null
  pdf_url:         string | null
  notes:           string | null
  created_at:      string
  updated_at:      string
}

// ─── TIPOS CON RELACIONES (para queries con joins) ────────────

export interface QuoteWithItems extends Quote {
  quote_items:  QuoteItem[]
  company?:     Pick<Company, 'id' | 'name' | 'contact_email'>
}

export interface OrderWithProducts extends Order {
  order_products:       OrderProduct[]
  order_status_events:  OrderStatusEvent[]
  company?:             Pick<Company, 'id' | 'name' | 'contact_name' | 'contact_email'>
}

export interface RequestThreadWithMessages extends RequestThread {
  thread_messages:  ThreadMessage[]
  company?:         Pick<Company, 'id' | 'name'>
  user?:            Pick<User, 'id' | 'full_name' | 'email'>
}

export interface CompanyWithRelations extends Company {
  users?:   User[]
  quotes?:  Quote[]
  orders?:  Order[]
}

// ─── TIPOS PARA FORMS (Insert / Update) ──────────────────────

export type CompanyInsert     = Omit<Company, 'id' | 'created_at' | 'updated_at'>
export type CompanyUpdate     = Partial<CompanyInsert>
export type UserInsert        = Omit<User, 'id' | 'created_at' | 'updated_at'>
export type UserUpdate        = Partial<UserInsert>
export type QuoteInsert       = Omit<Quote, 'id' | 'created_at' | 'updated_at'>
export type QuoteUpdate       = Partial<QuoteInsert>
export type QuoteItemInsert   = Omit<QuoteItem, 'id' | 'subtotal' | 'created_at'>
export type OrderInsert       = Omit<Order, 'id' | 'created_at' | 'updated_at'>
export type OrderUpdate       = Partial<OrderInsert>
export type OrderProductInsert = Omit<OrderProduct, 'id' | 'created_at' | 'updated_at'>

// ─── DATABASE TYPE (para Supabase client genérico) ────────────

export type Database = {
  public: {
    Tables: {
      companies: {
        Row:    Company
        Insert: CompanyInsert
        Update: CompanyUpdate
      }
      users: {
        Row:    User
        Insert: UserInsert
        Update: UserUpdate
      }
      request_threads: {
        Row:    RequestThread
        Insert: Omit<RequestThread, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<RequestThread, 'id' | 'created_at'>>
      }
      thread_messages: {
        Row:    ThreadMessage
        Insert: Omit<ThreadMessage, 'id' | 'created_at'>
        Update: never
      }
      quotes: {
        Row:    Quote
        Insert: QuoteInsert
        Update: QuoteUpdate
      }
      quote_items: {
        Row:    QuoteItem
        Insert: QuoteItemInsert
        Update: Partial<QuoteItemInsert>
      }
      purchase_orders: {
        Row:    PurchaseOrder
        Insert: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PurchaseOrder, 'id' | 'created_at'>>
      }
      orders: {
        Row:    Order
        Insert: OrderInsert
        Update: OrderUpdate
      }
      order_products: {
        Row:    OrderProduct
        Insert: OrderProductInsert
        Update: Partial<OrderProductInsert>
      }
      order_status_events: {
        Row:    OrderStatusEvent
        Insert: Omit<OrderStatusEvent, 'id' | 'created_at'>
        Update: never
      }
      invoices: {
        Row:    Invoice
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Invoice, 'id' | 'created_at'>>
      }
    }
  }
}
