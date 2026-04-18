-- ============================================================
-- GRAB IT MVP — Schema SQL completo para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── EXTENSIONES ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── FUNCIÓN AUTO-UPDATE updated_at ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── ENUMS ────────────────────────────────────────────────────
CREATE TYPE delivery_type          AS ENUM ('express', 'custom');
CREATE TYPE user_role               AS ENUM ('admin', 'client');
CREATE TYPE thread_status           AS ENUM ('open', 'complete', 'cancelled');
CREATE TYPE sender_role             AS ENUM ('client', 'admin', 'system');
CREATE TYPE quote_status_canonical  AS ENUM ('draft', 'sent', 'approved', 'rejected', 'expired');
CREATE TYPE po_status               AS ENUM ('received', 'parsed', 'accepted');
CREATE TYPE order_status_canonical  AS ENUM ('created', 'purchasing', 'in_transit', 'delivered', 'issue', 'cancelled');
CREATE TYPE order_product_status    AS ENUM ('pending', 'purchased', 'shipped', 'delivered', 'issue', 'cancelled');
CREATE TYPE invoice_status          AS ENUM ('draft', 'issued', 'paid', 'voided');
CREATE TYPE currency_type           AS ENUM ('USD', 'COP');

-- ─── TABLA 1: COMPANIES ───────────────────────────────────────
CREATE TABLE companies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  ruc_nit         TEXT,
  address         TEXT,
  city            TEXT,
  country         TEXT,
  delivery_type   delivery_type NOT NULL DEFAULT 'express',
  payment_terms   TEXT,
  contact_name    TEXT,
  contact_email   TEXT,
  contact_phone   TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── TABLA 2: USERS ──────────────────────────────────────────
-- Extiende auth.users de Supabase con datos de negocio
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'client',
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── TABLA 3: REQUEST_THREADS ─────────────────────────────────
CREATE TABLE request_threads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title       TEXT,
  status      thread_status NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_request_threads_updated_at
  BEFORE UPDATE ON request_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── TABLA 4: THREAD_MESSAGES ─────────────────────────────────
CREATE TABLE thread_messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id    UUID NOT NULL REFERENCES request_threads(id) ON DELETE CASCADE,
  sender_role  sender_role NOT NULL,
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA 5: QUOTES ──────────────────────────────────────────
CREATE TABLE quotes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id         UUID REFERENCES request_threads(id) ON DELETE SET NULL,
  company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  status_canonical  quote_status_canonical NOT NULL DEFAULT 'draft',
  status_label      TEXT,          -- ej. "Pendiente aprobación interna"
  status_reason     TEXT,          -- ej. "Precio acordado con proveedor"
  currency          currency_type NOT NULL DEFAULT 'USD',
  total_price       NUMERIC(14,2) NOT NULL DEFAULT 0,
  valid_until       DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── TABLA 6: QUOTE_ITEMS ─────────────────────────────────────
CREATE TABLE quote_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id      UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_name  TEXT NOT NULL,
  product_url   TEXT,
  quantity      INTEGER NOT NULL DEFAULT 1,
  unit_price    NUMERIC(14,2) NOT NULL DEFAULT 0,
  subtotal      NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA 7: PURCHASE_ORDERS ─────────────────────────────────
CREATE TABLE purchase_orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id          UUID NOT NULL REFERENCES quotes(id) ON DELETE RESTRICT,
  company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  client_po_number  TEXT,
  status            po_status NOT NULL DEFAULT 'received',
  po_pdf_url        TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── TABLA 8: ORDERS ──────────────────────────────────────────
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id          UUID REFERENCES quotes(id) ON DELETE SET NULL,
  po_id             UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  status_canonical  order_status_canonical NOT NULL DEFAULT 'created',
  status_label      TEXT,          -- ej. "En aduana Panama"
  status_reason     TEXT,
  delivery_type     delivery_type NOT NULL DEFAULT 'express',
  notes             TEXT,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── TABLA 9: ORDER_PRODUCTS ──────────────────────────────────
CREATE TABLE order_products (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  quantity            INTEGER NOT NULL DEFAULT 1,
  unit_price_client   NUMERIC(14,2) NOT NULL DEFAULT 0,   -- precio que ve el cliente
  unit_cost_purchase  NUMERIC(14,2) NOT NULL DEFAULT 0,   -- costo real de compra (interno)
  shipping_cost       NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_cost            NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_cost          NUMERIC(14,2) NOT NULL DEFAULT 0,   -- costo total interno
  status              order_product_status NOT NULL DEFAULT 'pending',
  tracking_number     TEXT,
  product_url         TEXT,
  notes               TEXT,
  delivered_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_order_products_updated_at
  BEFORE UPDATE ON order_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── TABLA 10: ORDER_STATUS_EVENTS ────────────────────────────
CREATE TABLE order_status_events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status_canonical  TEXT,
  status_label      TEXT,
  notes             TEXT,
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA 11: INVOICES ───────────────────────────────────────
CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  status          invoice_status NOT NULL DEFAULT 'draft',
  total_billed    NUMERIC(14,2) NOT NULL DEFAULT 0,
  invoice_number  TEXT UNIQUE,
  issued_at       TIMESTAMPTZ,
  due_at          TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  pdf_url         TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── ÍNDICES DE PERFORMANCE ───────────────────────────────────
CREATE INDEX idx_users_company_id            ON users(company_id);
CREATE INDEX idx_users_email                 ON users(email);
CREATE INDEX idx_request_threads_company_id  ON request_threads(company_id);
CREATE INDEX idx_request_threads_user_id     ON request_threads(user_id);
CREATE INDEX idx_request_threads_status      ON request_threads(status);
CREATE INDEX idx_thread_messages_thread_id   ON thread_messages(thread_id);
CREATE INDEX idx_thread_messages_created_at  ON thread_messages(created_at);
CREATE INDEX idx_quotes_company_id           ON quotes(company_id);
CREATE INDEX idx_quotes_thread_id            ON quotes(thread_id);
CREATE INDEX idx_quotes_status_canonical     ON quotes(status_canonical);
CREATE INDEX idx_quote_items_quote_id        ON quote_items(quote_id);
CREATE INDEX idx_purchase_orders_quote_id    ON purchase_orders(quote_id);
CREATE INDEX idx_purchase_orders_company_id  ON purchase_orders(company_id);
CREATE INDEX idx_orders_company_id           ON orders(company_id);
CREATE INDEX idx_orders_status_canonical     ON orders(status_canonical);
CREATE INDEX idx_order_products_order_id     ON order_products(order_id);
CREATE INDEX idx_order_status_events_order   ON order_status_events(order_id);
CREATE INDEX idx_invoices_order_id           ON invoices(order_id);
CREATE INDEX idx_invoices_company_id         ON invoices(company_id);

-- ─── RLS — ROW LEVEL SECURITY ─────────────────────────────────
-- Habilitar RLS en todas las tablas
ALTER TABLE companies           ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_threads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices            ENABLE ROW LEVEL SECURITY;

-- Función helper para obtener el company_id del usuario actual
CREATE OR REPLACE FUNCTION my_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Función helper para verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── POLÍTICAS RLS ────────────────────────────────────────────

-- Companies: admin ve todo, cliente solo la suya
CREATE POLICY "companies_select" ON companies FOR SELECT
  USING (is_admin() OR id = my_company_id());

CREATE POLICY "companies_all_admin" ON companies FOR ALL
  USING (is_admin());

-- Users: admin ve todo, cliente solo los de su empresa
CREATE POLICY "users_select" ON users FOR SELECT
  USING (is_admin() OR company_id = my_company_id());

CREATE POLICY "users_all_admin" ON users FOR ALL
  USING (is_admin());

-- Request threads: admin ve todo, cliente solo los suyos
CREATE POLICY "threads_select" ON request_threads FOR SELECT
  USING (is_admin() OR company_id = my_company_id());

CREATE POLICY "threads_insert_client" ON request_threads FOR INSERT
  WITH CHECK (company_id = my_company_id());

CREATE POLICY "threads_update_admin" ON request_threads FOR UPDATE
  USING (is_admin());

-- Thread messages: misma empresa o admin
CREATE POLICY "messages_select" ON thread_messages FOR SELECT
  USING (
    is_admin() OR
    thread_id IN (SELECT id FROM request_threads WHERE company_id = my_company_id())
  );

CREATE POLICY "messages_insert" ON thread_messages FOR INSERT
  WITH CHECK (
    is_admin() OR
    thread_id IN (SELECT id FROM request_threads WHERE company_id = my_company_id())
  );

-- Quotes: admin ve todo, cliente solo las suyas
CREATE POLICY "quotes_select" ON quotes FOR SELECT
  USING (is_admin() OR company_id = my_company_id());

CREATE POLICY "quotes_all_admin" ON quotes FOR ALL
  USING (is_admin());

-- Quote items: vía quote
CREATE POLICY "quote_items_select" ON quote_items FOR SELECT
  USING (
    is_admin() OR
    quote_id IN (SELECT id FROM quotes WHERE company_id = my_company_id())
  );

CREATE POLICY "quote_items_all_admin" ON quote_items FOR ALL
  USING (is_admin());

-- Purchase orders
CREATE POLICY "po_select" ON purchase_orders FOR SELECT
  USING (is_admin() OR company_id = my_company_id());

CREATE POLICY "po_all_admin" ON purchase_orders FOR ALL
  USING (is_admin());

-- Orders
CREATE POLICY "orders_select" ON orders FOR SELECT
  USING (is_admin() OR company_id = my_company_id());

CREATE POLICY "orders_all_admin" ON orders FOR ALL
  USING (is_admin());

-- Order products: vía order
CREATE POLICY "order_products_select" ON order_products FOR SELECT
  USING (
    is_admin() OR
    order_id IN (SELECT id FROM orders WHERE company_id = my_company_id())
  );

CREATE POLICY "order_products_all_admin" ON order_products FOR ALL
  USING (is_admin());

-- Order status events
CREATE POLICY "events_select" ON order_status_events FOR SELECT
  USING (
    is_admin() OR
    order_id IN (SELECT id FROM orders WHERE company_id = my_company_id())
  );

CREATE POLICY "events_insert_admin" ON order_status_events FOR INSERT
  WITH CHECK (is_admin());

-- Invoices
CREATE POLICY "invoices_select" ON invoices FOR SELECT
  USING (is_admin() OR company_id = my_company_id());

CREATE POLICY "invoices_all_admin" ON invoices FOR ALL
  USING (is_admin());

-- ─── DATOS INICIALES — Empresa y usuario admin ─────────────────
-- INSTRUCCIÓN: Reemplaza los valores de ejemplo antes de ejecutar

-- 1. Primero crea el usuario en Supabase Auth (Dashboard → Authentication → Users → Invite user)
-- 2. Copia el UUID generado y reemplázalo abajo en lugar de '00000000-0000-0000-0000-000000000001'

-- INSERT INTO companies (id, name, delivery_type, contact_email)
-- VALUES (
--   'aaaaaaaa-0000-0000-0000-000000000001',
--   'Grab It SAS',
--   'express',
--   'hola@grabit.app'
-- );

-- INSERT INTO users (id, company_id, email, full_name, role)
-- VALUES (
--   '<UUID del usuario en auth.users>',          -- reemplazar
--   'aaaaaaaa-0000-0000-0000-000000000001',
--   'admin@grabit.app',                          -- reemplazar con tu email real
--   'Admin Grab It',
--   'admin'
-- );
