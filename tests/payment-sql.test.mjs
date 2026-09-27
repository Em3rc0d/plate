// Usage: PGLITE_MODULE=/absolute/path/to/@electric-sql/pglite node --test tests/payment-sql.test.mjs
import { test } from "node:test";
import { createRequire } from "node:module";
const loadDependency = createRequire(import.meta.url);
import fs from "node:fs";
import assert from "node:assert/strict";
test("real PostgreSQL functions: idempotency, TEST isolation, stale events and terminal states", async () => {
  assert.ok(
    process.env.PGLITE_MODULE,
    "Set PGLITE_MODULE to a locally installed @electric-sql/pglite",
  );
  const { PGlite } = loadDependency(process.env.PGLITE_MODULE);
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role;
 create schema auth; create function auth.jwt() returns jsonb language sql as $$select '{}'::jsonb$$;
 create table public.orders(id uuid primary key,status text,amount_pen numeric,payment_method text,paid_at timestamptz,payment_reference text);`);
    for (const name of [
      "20260927210000_mercado_pago_checkout.sql",
      "20260927222105_harden_payment_test_isolation.sql",
    ])
      await db.exec(fs.readFileSync("supabase/migrations/" + name, "utf8"));
    await db.exec(fs.readFileSync("tests/payment-state.sql", "utf8"));
    console.log(
      "SQL invariants verified in isolated PostgreSQL (PGlite); no external services used.",
    );
  } finally {
    await db.close();
  }
});
