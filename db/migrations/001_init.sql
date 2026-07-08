CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY,
  name text NOT NULL CHECK (btrim(name) <> ''),
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('draft', 'confirmed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,

  CHECK (confirmed_at IS NULL OR confirmed_at >= created_at),
  CHECK (cancelled_at IS NULL OR cancelled_at >= created_at),

  CHECK (
    (status = 'draft' AND confirmed_at IS NULL AND cancelled_at IS NULL)
    OR
    (status IN ('confirmed') AND confirmed_at IS NOT NULL AND cancelled_at IS NULL)
    OR
    (status = 'cancelled' AND cancelled_at IS NOT NULL AND confirmed_at IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS order_items (
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  product_name text NOT NULL,
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),

  PRIMARY KEY (order_id, product_id),

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS order_discounts (
  order_id uuid NOT NULL,
  code text NOT NULL,
  description text NOT NULL,
  amount_in_cents integer NOT NULL CHECK (amount_in_cents >= 0),

  PRIMARY KEY (order_id, code),

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);