// Offline contract tests. No network calls or real credentials are used.
import { test } from "node:test";
import { createRequire } from "node:module";
const loadDependency = createRequire(import.meta.url);
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";
import ts from "typescript";
function load(file, overrides = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(
    code,
    {
      exports,
      require: (name) => {
        if (name === "server-only") return {};
        if (name in overrides) return overrides[name];
        if (name.startsWith("@/")) throw Error(`Unexpected dependency ${name}`);
        return loadDependency(name);
      },
      Request,
      Response,
      URL,
      URLSearchParams,
      AbortSignal,
      Buffer,
      Date,
      console: { error() {} },
      fetch:
        overrides.fetch ??
        (() => {
          throw Error("NETWORK_FORBIDDEN");
        }),
    },
    { filename: file },
  );
  return exports;
}
const baseEnv = {
  VEHICLE_PROVIDER_EXECUTION_ENABLED: true,
  MERCADO_PAGO_LIVE_MODE: false,
  MERCADO_PAGO_ACCESS_TOKEN: "TEST-fixture",
  NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY: "TEST-fixture",
  MERCADO_PAGO_COLLECTOR_ID: "123",
  MERCADO_PAGO_WEBHOOK_SECRET: "offline-fixture",
};
const order = {
  id: "order-fixture",
  amount_pen: 15.9,
  plate: "XYZ753",
  email: "fixture@example.test",
};
const instrument = {
  token: "synthetic-token",
  paymentMethodId: "yape",
  installments: 1,
};
function fixture(options = {}) {
  let attempt;
  const calls = [];
  const env = { ...baseEnv, ...options.env };
  const checked = (r) => {
    if (r.error) throw Error(r.error.message);
    return r.data;
  };
  const db = {
    rpc(name, args) {
      if (name === "claim_mercado_pago_attempt")
        return {
          single: async () => {
            const created = !attempt;
            if (created)
              attempt = {
                id: "attempt-fixture",
                order_id: order.id,
                status: "CREATING",
                provider_status: null,
                provider_payment_id: null,
                live_mode: null,
                payment_method_id: args.p_payment_method_id,
                amount_minor: 1590,
                currency: "PEN",
              };
            return { data: { attempt_id: attempt.id, created } };
          },
        };
      assert.equal(args.p_mark_paid, false);
      Object.assign(attempt, {
        status: args.p_status,
        live_mode: args.p_live_mode,
      });
      return Promise.resolve({ data: options.badRpcResult ?? false });
    },
    from(table) {
      assert.equal(table, "payment_attempts");
      let update,
        filters = [];
      const builder = {
        select() {
          return this;
        },
        eq(k, v) {
          filters.push([k, v]);
          return this;
        },
        is(k, v) {
          filters.push([k, v]);
          return this;
        },
        update(v) {
          update = v;
          return this;
        },
        single: async () => ({ data: attempt }),
        maybeSingle: async () => ({ data: attempt }),
        then(resolve) {
          const match = filters.every(([k, v]) => attempt[k] === v);
          if (update && match) Object.assign(attempt, update);
          return Promise.resolve({
            data: match ? [{ id: attempt.id }] : [],
          }).then(resolve);
        },
      };
      return builder;
    },
  };
  const api = load("src/payments/mercado-pago.ts", {
    "@/src/config/env": { env, mercadoPagoConfigured: true },
    "@/src/db/client": { db: () => db, checked, required: checked },
    fetch: async (url, init) => {
      calls.push({ url, init });
      if (init.method === "POST") {
        if (options.transportError) throw Error("timeout");
        if (options.httpError)
          return Response.json(
            { error: "bad_request", message: "fixture-error" },
            { status: options.httpError },
          );
        return Response.json({ id: 777 });
      }
      if (url.includes("/search?"))
        return Response.json({ paging: { total: 0 }, results: [] });
      return Response.json({
        id: 777,
        external_reference: "attempt-fixture",
        transaction_amount: 15.9,
        currency_id: "PEN",
        collector_id: 123,
        live_mode: false,
        payment_method_id: instrument.paymentMethodId,
        status: options.status ?? "approved",
        date_last_updated: "2026-09-27T20:00:00Z",
        ...options.snapshot,
      });
    },
  });
  return { api, calls, getAttempt: () => attempt };
}
test("TEST approved is persisted but never fulfills, even with an erroneous true RPC return", async () => {
  const f = fixture({ badRpcResult: true });
  const r = await f.api.createMercadoPagoPayment(
    order,
    instrument,
    "request-fixture",
  );
  assert.equal(r.status, "APPROVED");
  assert.equal(r.shouldFulfill, false);
  assert.equal(r.liveMode, false);
  assert.equal(f.getAttempt().status, "APPROVED");
  const payload = JSON.parse(f.calls[0].init.body);
  assert.equal(payload.installments, 1);
  assert.equal(payload.payment_method_id, "yape");
  assert.equal("otp" in payload, false);
});
test("concurrent duplicate submissions perform only one payment POST", async () => {
  const f = fixture();
  await Promise.all(
    Array.from({ length: 8 }, () =>
      f.api.createMercadoPagoPayment(order, instrument, "request-fixture"),
    ),
  );
  assert.equal(f.calls.filter((c) => c.init.method === "POST").length, 1);
});
test("deterministic creation failure replays REJECTED without a new POST or search", async () => {
  const f = fixture({ httpError: 400 });
  for (let i = 0; i < 2; i++) {
    const r = await f.api.createMercadoPagoPayment(
      order,
      instrument,
      "request-fixture",
    );
    assert.equal(r.status, "REJECTED");
  }
  assert.equal(f.calls.length, 1);
});
for (const status of [408, 409, 429, 500])
  test(`HTTP ${status} stays ambiguous and does not permit automatic repost`, async () => {
    const f = fixture({ httpError: status });
    for (let i = 0; i < 2; i++) {
      const r = await f.api.createMercadoPagoPayment(
        order,
        instrument,
        "request-fixture",
      );
      assert.equal(r.status, "CREATING");
      assert.equal(r.shouldFulfill, false);
    }
    assert.equal(f.calls.filter((c) => c.init.method === "POST").length, 1);
  });
test("transport timeout stays ambiguous", async () => {
  const f = fixture({ transportError: true });
  const r = await f.api.createMercadoPagoPayment(
    order,
    instrument,
    "request-fixture",
  );
  assert.equal(r.status, "CREATING");
});
for (const method of ["yape", "visa"])
  test(`${method} provider rejection never fulfills`, async () => {
    const f = fixture({
      status: "rejected",
      snapshot: { payment_method_id: method },
    });
    const r = await f.api.createMercadoPagoPayment(
      order,
      { ...instrument, paymentMethodId: method },
      "request-fixture",
    );
    assert.equal(r.status, "REJECTED");
    assert.equal(r.shouldFulfill, false);
  });
for (const snapshot of [
  { live_mode: true },
  { payment_method_id: "visa" },
  { collector_id: 999 },
  { transaction_amount: 1 },
])
  test(`mismatched provider snapshot fails closed ${JSON.stringify(snapshot)}`, async () => {
    const f = fixture({ snapshot });
    await assert.rejects(
      () =>
        f.api.createMercadoPagoPayment(order, instrument, "request-fixture"),
      /MISMATCH/,
    );
  });
test("multiple installments fail before network", async () => {
  const f = fixture();
  await assert.rejects(
    () =>
      f.api.createMercadoPagoPayment(
        order,
        { ...instrument, installments: 2 },
        "request-fixture",
      ),
    /INVALID_INSTRUMENT/,
  );
  assert.equal(f.calls.length, 0);
});
test("mixed credential environments fail before network", async () => {
  const f = fixture({
    env: { NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY: "APP_USR-fixture" },
  });
  await assert.rejects(
    () => f.api.createMercadoPagoPayment(order, instrument, "request-fixture"),
    /TEST_CREDENTIAL_REQUIRED/,
  );
  assert.equal(f.calls.length, 0);
});
test("signed webhook accepts valid manifest; rejects tampering, stale timestamps, absent signatures, duplicate IDs", () => {
  const { api } = fixture();
  const ts = String(Date.now());
  const sign = (timestamp) =>
    crypto
      .createHmac("sha256", baseEnv.MERCADO_PAGO_WEBHOOK_SECRET)
      .update(`id:777;request-id:request-fixture;ts:${timestamp};`)
      .digest("hex");
  const request = (
    query = "data.id=777",
    timestamp = ts,
    signature = sign(timestamp),
  ) =>
    new Request(`https://example.test/webhook?${query}`, {
      headers: {
        "x-request-id": "request-fixture",
        "x-signature": `ts=${timestamp},v1=${signature}`,
      },
    });
  assert.equal(api.verifyMercadoPagoWebhook(request()), "777");
  for (const r of [
    request("data.id=778"),
    request("data.id=777&data.id=777"),
    request("data.id=777", String(Date.now() - 600000)),
    request("data.id=777", ts, "0".repeat(64)),
    new Request("https://example.test/webhook?data.id=777"),
  ])
    assert.throws(() => api.verifyMercadoPagoWebhook(r), /INVALID_SIGNATURE/);
});
test("global TEST firewall returns before any vehicle network or database call, including admin calls without query ID", async () => {
  let network = 0,
    database = 0;
  const { call } = load("src/providers/http.ts", {
    "@/src/config/env": { env: baseEnv },
    "@/src/db/client": {
      db: () => {
        database++;
        throw Error("DB_FORBIDDEN");
      },
    },
    "@/src/utils/security": {},
    "@/src/observability": {},
    "@/src/analytics": {},
    "./types": {},
    fetch: () => {
      network++;
      throw Error("NETWORK_FORBIDDEN");
    },
  });
  for (const id of [null, "query-fixture"])
    for (const provider of ["Masitaprex", "PlacApi", "ConsultaDatos"]) {
      const r = await call(
        {
          provider,
          endpoint: "https://invalid.test",
          key: "configured",
          section: "registry",
          source: "fixture",
          cost: 1,
        },
        "XYZ753",
        id,
      );
      assert.equal(r.errorCode, "PAYMENT_TEST_MODE_BLOCKED");
      assert.equal(r.cost, 0);
    }
  assert.equal(network, 0);
  assert.equal(database, 0);
});
test("LIVE mode alone cannot unlock vehicle providers", async () => {
  const { call } = load("src/providers/http.ts", {
    "@/src/config/env": {
      env: {
        ...baseEnv,
        MERCADO_PAGO_LIVE_MODE: true,
        VEHICLE_PROVIDER_EXECUTION_ENABLED: false,
      },
    },
    "@/src/db/client": {},
    "@/src/utils/security": {},
    "@/src/observability": {},
    "@/src/analytics": {},
    "./types": {},
  });
  const r = await call(
    {
      provider: "Masitaprex",
      endpoint: "https://invalid.test",
      key: "configured",
      section: "registry",
      source: "fixture",
      cost: 1,
    },
    "XYZ753",
    null,
  );
  assert.equal(r.errorCode, "PROVIDER_EXECUTION_DISABLED");
});
test("credential diagnostics use only read requests and never claim same-app proof", async () => {
  const f = fixture();
  const d = await f.api.diagnoseMercadoPagoTestCredentials();
  assert.equal(d.sameApplicationVerified, false);
  assert.equal(d.vehicleProvidersBlocked, true);
  assert.equal(f.calls.length, 2);
  assert.ok(f.calls.every((c) => c.init.method === "GET"));
  assert.ok(!JSON.stringify(d).includes("TEST-fixture"));
});
