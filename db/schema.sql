CREATE TABLE IF NOT EXISTS hk_config (
 id smallint PRIMARY KEY CHECK (id=1), version integer NOT NULL DEFAULT 1,
 catalog jsonb NOT NULL, rules jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS hk_orders (
 id uuid PRIMARY KEY, reference text UNIQUE NOT NULL, idempotency_key uuid UNIQUE NOT NULL,
 payload_hash text NOT NULL, status text NOT NULL DEFAULT 'pendiente' CHECK(status IN ('pendiente','confirmado','preparando','listo','en_camino','entregado','cancelado')),
 details jsonb NOT NULL, total integer NOT NULL CHECK(total>=0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), is_test boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS hk_orders_created ON hk_orders(created_at DESC);
CREATE TABLE IF NOT EXISTS hk_order_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, order_id uuid REFERENCES hk_orders(id) NOT NULL,
 status text NOT NULL, actor text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hk_order_events_order ON hk_order_events(order_id,created_at);
CREATE TABLE IF NOT EXISTS hk_rate_limits (
 key text PRIMARY KEY, hits integer NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS hk_admin_audit (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor text NOT NULL,
 action text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
