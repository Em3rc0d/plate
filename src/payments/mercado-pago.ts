import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { db, checked, required } from "@/src/db/client";
import { env, mercadoPagoConfigured } from "@/src/config/env";
import type { OrderRow } from "@/src/vehicle/canonical";

const API = "https://api.mercadopago.com";

type Instrument = {
  token: string;
  paymentMethodId: string;
  installments: number;
  issuerId?: string;
};

type AttemptRow = {
  id: string;
  order_id: string;
  request_key_hash: string;
  fingerprint: string;
  payment_method_id: string;
  amount_minor: number;
  currency: string;
  provider_payment_id: string | null;
  provider_status: string | null;
  status:
    | "CREATING"
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED"
    | "REFUNDED"
    | "CHARGED_BACK"
    | "UNKNOWN";
  live_mode: boolean | null;
  provider_updated_at: string | null;
};

type ProviderPayment = {
  id: string | number;
  external_reference?: string;
  transaction_amount?: number | string;
  currency_id?: string;
  collector_id?: string | number;
  live_mode?: boolean;
  status?: string;
  status_detail?: string;
  date_last_updated?: string;
  transaction_amount_refunded?: number | string;
};

export type PaymentResult = {
  attemptId: string;
  providerPaymentId: string | null;
  status: AttemptRow["status"];
  providerStatus: string | null;
  statusDetail?: string;
  liveMode: boolean | null;
  shouldFulfill: boolean;
  testMode: boolean;
};

const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

function assertConfigured() {
  if (!mercadoPagoConfigured) throw new Error("PAYMENT_NOT_CONFIGURED");
  if (
    !env.MERCADO_PAGO_LIVE_MODE &&
    !env.MERCADO_PAGO_ACCESS_TOKEN.startsWith("TEST-")
  )
    throw new Error("MERCADO_PAGO_TEST_CREDENTIAL_REQUIRED");
  if (
    env.MERCADO_PAGO_LIVE_MODE &&
    env.MERCADO_PAGO_ACCESS_TOKEN.startsWith("TEST-")
  )
    throw new Error("MERCADO_PAGO_LIVE_CREDENTIAL_REQUIRED");
}

class MercadoPagoHttpError extends Error {
  constructor(
    readonly status: number,
    readonly providerError: string | null,
    readonly providerMessage: string | null,
  ) {
    super("PROVIDER_HTTP_ERROR");
  }
}

async function providerRequest(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; idempotencyKey?: string } = {},
) {
  assertConfigured();
  try {
    const response = await fetch(`${API}${path}`, {
      method: init.method ?? "GET",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      headers: {
        Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        ...(init.idempotencyKey
          ? { "X-Idempotency-Key": init.idempotencyKey }
          : {}),
      },
      ...(init.body ? { body: JSON.stringify(init.body) } : {}),
    });
    const payload = (await response.json().catch(() => null)) as
      | { message?: string; error?: string; status?: number; cause?: unknown }
      | null;
    if (!response.ok) {
      console.error("mercadopago_provider_error", {
        path,
        status: response.status,
        error: payload?.error ?? null,
        message: payload?.message ?? null,
      });
      throw new MercadoPagoHttpError(
        response.status,
        payload?.error ?? null,
        payload?.message ?? null,
      );
    }
    return payload as unknown;
  } catch (error) {
    if (error instanceof MercadoPagoHttpError) throw error;
    console.error("mercadopago_transport_error", {
      path,
      name: error instanceof Error ? error.name : "unknown",
    });
    throw new Error("PROVIDER_UNAVAILABLE");
  }
}

function normalizeStatus(status: string | undefined): AttemptRow["status"] {
  if (status === "approved") return "APPROVED";
  if (["pending", "in_process", "authorized"].includes(status ?? ""))
    return "PENDING";
  if (status === "rejected") return "REJECTED";
  if (status === "cancelled") return "CANCELLED";
  if (status === "refunded") return "REFUNDED";
  if (status === "charged_back") return "CHARGED_BACK";
  return "UNKNOWN";
}

function amountMinor(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0)
    throw new Error("INVALID_PROVIDER_AMOUNT");
  return Math.round(number * 100);
}

async function attemptById(id: string) {
  return required(
    await db().from("payment_attempts").select("*").eq("id", id).single(),
  ) as AttemptRow;
}

async function attachProviderId(attemptId: string, providerId: string) {
  const rows = required(
    await db()
      .from("payment_attempts")
      .update({ provider_payment_id: providerId, updated_at: new Date().toISOString() })
      .eq("id", attemptId)
      .is("provider_payment_id", null)
      .select("id"),
  );
  if (!rows.length) {
    const attempt = await attemptById(attemptId);
    if (attempt.provider_payment_id !== providerId)
      throw new Error("PROVIDER_ID_MISMATCH");
  }
}

function verifyProviderPayment(attempt: AttemptRow, raw: ProviderPayment) {
  const id = String(raw.id ?? "");
  if (!/^\d+$/.test(id)) throw new Error("INVALID_PROVIDER_ID");
  if (raw.external_reference !== attempt.id)
    throw new Error("PROVIDER_REFERENCE_MISMATCH");
  if (amountMinor(raw.transaction_amount) !== Number(attempt.amount_minor))
    throw new Error("PROVIDER_AMOUNT_MISMATCH");
  if (raw.currency_id !== attempt.currency)
    throw new Error("PROVIDER_CURRENCY_MISMATCH");
  if (String(raw.collector_id ?? "") !== env.MERCADO_PAGO_COLLECTOR_ID)
    throw new Error("PROVIDER_ACCOUNT_MISMATCH");
  if (raw.live_mode !== env.MERCADO_PAGO_LIVE_MODE)
    throw new Error("PROVIDER_MODE_MISMATCH");
  if (typeof raw.status !== "string" || typeof raw.date_last_updated !== "string")
    throw new Error("INVALID_PROVIDER_SNAPSHOT");
  const updated = new Date(raw.date_last_updated);
  if (!Number.isFinite(updated.getTime()))
    throw new Error("INVALID_PROVIDER_SNAPSHOT");
  return {
    providerId: id,
    providerStatus: raw.status,
    statusDetail: raw.status_detail,
    status: normalizeStatus(raw.status),
    liveMode: raw.live_mode,
    updatedAt: updated.toISOString(),
  };
}

async function applySnapshot(attempt: AttemptRow, raw: ProviderPayment) {
  const snapshot = verifyProviderPayment(attempt, raw);
  const shouldFulfill =
    checked(
      await db().rpc("sync_mercado_pago_attempt", {
        p_attempt: attempt.id,
        p_provider_id: snapshot.providerId,
        p_provider_status: snapshot.providerStatus,
        p_status: snapshot.status,
        p_live_mode: snapshot.liveMode,
        p_updated_at: snapshot.updatedAt,
        p_mark_paid: env.MERCADO_PAGO_LIVE_MODE,
      }),
    ) === true;
  return {
    attemptId: attempt.id,
    providerPaymentId: snapshot.providerId,
    status: snapshot.status,
    providerStatus: snapshot.providerStatus,
    statusDetail: snapshot.statusDetail,
    liveMode: snapshot.liveMode,
    shouldFulfill,
    testMode: !env.MERCADO_PAGO_LIVE_MODE,
  } satisfies PaymentResult;
}

async function getProviderPayment(providerId: string) {
  return (await providerRequest(
    `/v1/payments/${encodeURIComponent(providerId)}`,
  )) as ProviderPayment;
}

async function findByExternalReference(attemptId: string) {
  const params = new URLSearchParams({
    external_reference: attemptId,
    limit: "2",
    offset: "0",
  });
  const result = (await providerRequest(
    `/v1/payments/search?${params.toString()}`,
  )) as {
    paging?: { total?: number };
    results?: ProviderPayment[];
  };
  if (
    !Array.isArray(result.results) ||
    !Number.isSafeInteger(result.paging?.total)
  )
    throw new Error("INVALID_PROVIDER_SEARCH");
  if ((result.paging?.total ?? 0) > 1 || result.results.length > 1)
    throw new Error("AMBIGUOUS_PROVIDER_RESULT");
  return result.results[0] ?? null;
}

async function syncProviderPayment(raw: ProviderPayment) {
  const providerId = String(raw.id ?? "");
  const reference = raw.external_reference;
  let attempt = checked(
    await db()
      .from("payment_attempts")
      .select("*")
      .eq("provider_payment_id", providerId)
      .maybeSingle(),
  ) as AttemptRow | null;
  if (!attempt && typeof reference === "string") {
    attempt = checked(
      await db()
        .from("payment_attempts")
        .select("*")
        .eq("id", reference)
        .maybeSingle(),
    ) as AttemptRow | null;
    if (attempt) await attachProviderId(attempt.id, providerId);
  }
  if (!attempt) return null;
  return applySnapshot(attempt, raw);
}

export async function createMercadoPagoPayment(
  order: OrderRow,
  instrument: Instrument,
  idempotencyKey: string,
): Promise<PaymentResult> {
  assertConfigured();
  if (!/^[A-Za-z0-9_.:@/-]{8,160}$/.test(idempotencyKey))
    throw new Error("INVALID_IDEMPOTENCY_KEY");
  if (!instrument.token || instrument.token.length > 4096)
    throw new Error("INVALID_TOKEN");
  if (
    !/^[a-z0-9_-]{2,80}$/i.test(instrument.paymentMethodId) ||
    !Number.isInteger(instrument.installments) ||
    instrument.installments < 1 ||
    instrument.installments > 48
  )
    throw new Error("INVALID_INSTRUMENT");

  const fingerprint = digest([
    order.id,
    Math.round(Number(order.amount_pen) * 100),
    instrument.paymentMethodId,
    instrument.installments,
    instrument.issuerId ?? null,
    digest(instrument.token),
  ]);
  const requestKeyHash = digest([order.id, idempotencyKey]);
  const claim = required(
    await db()
      .rpc("claim_mercado_pago_attempt", {
        p_order: order.id,
        p_request_key_hash: requestKeyHash,
        p_fingerprint: fingerprint,
        p_payment_method_id: instrument.paymentMethodId,
      })
      .single(),
  ) as { attempt_id: string; created: boolean };

  let attempt = await attemptById(claim.attempt_id);

  if (!claim.created) {
    if (attempt.provider_payment_id)
      return applySnapshot(
        attempt,
        await getProviderPayment(attempt.provider_payment_id),
      );
    const recovered = await findByExternalReference(attempt.id);
    if (recovered) {
      await attachProviderId(attempt.id, String(recovered.id));
      attempt = await attemptById(attempt.id);
      return applySnapshot(attempt, recovered);
    }
    return {
      attemptId: attempt.id,
      providerPaymentId: null,
      status: "CREATING",
      providerStatus: null,
      liveMode: null,
      shouldFulfill: false,
      testMode: !env.MERCADO_PAGO_LIVE_MODE,
    };
  }

  let created: { id?: string | number };
  try {
    created = (await providerRequest("/v1/payments", {
      method: "POST",
      idempotencyKey: attempt.id,
      body: {
        transaction_amount: Number(order.amount_pen),
        token: instrument.token,
        payment_method_id: instrument.paymentMethodId,
        installments: instrument.installments,
        ...(instrument.issuerId ? { issuer_id: instrument.issuerId } : {}),
        payer: {
          email: env.MERCADO_PAGO_LIVE_MODE
            ? order.email
            : "test_user_pe@testuser.com",
        },
        description: `Reporte vehicular PlacaClara ${order.plate}`,
        external_reference: attempt.id,
      },
    })) as { id?: string | number };
  } catch (error) {
    if (error instanceof MercadoPagoHttpError && error.status >= 400 && error.status < 500) {
      await db()
        .from("payment_attempts")
        .update({
          status: "REJECTED",
          provider_status: error.providerError ?? "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", attempt.id)
        .eq("status", "CREATING");
      return {
        attemptId: attempt.id,
        providerPaymentId: null,
        status: "REJECTED",
        providerStatus: error.providerError,
        statusDetail: error.providerMessage ?? undefined,
        liveMode: null,
        shouldFulfill: false,
        testMode: !env.MERCADO_PAGO_LIVE_MODE,
      };
    }

    // Transport/5xx ambiguity: never POST again automatically. The same logical
    // attempt can only be recovered by external_reference / provider GET.
    return {
      attemptId: attempt.id,
      providerPaymentId: null,
      status: "CREATING",
      providerStatus: null,
      liveMode: null,
      shouldFulfill: false,
      testMode: !env.MERCADO_PAGO_LIVE_MODE,
    };
  }

  const providerId = String(created.id ?? "");
  if (!/^\d+$/.test(providerId)) throw new Error("INVALID_PROVIDER_ID");
  await attachProviderId(attempt.id, providerId);
  attempt = await attemptById(attempt.id);
  return applySnapshot(attempt, await getProviderPayment(providerId));
}

export async function syncMercadoPagoByProviderId(providerId: string) {
  if (!/^\d+$/.test(providerId)) throw new Error("INVALID_PROVIDER_ID");
  return syncProviderPayment(await getProviderPayment(providerId));
}

export function verifyMercadoPagoWebhook(request: Request) {
  assertConfigured();
  const url = new URL(request.url);
  const ids = url.searchParams.getAll("data.id");
  if (ids.length !== 1 || !/^[A-Za-z0-9]{1,128}$/.test(ids[0]))
    throw new Error("INVALID_SIGNATURE");
  const requestId = request.headers.get("x-request-id");
  const signature = request.headers.get("x-signature");
  if (
    !requestId ||
    !/^[A-Za-z0-9_-]{1,200}$/.test(requestId) ||
    !signature ||
    signature.length >= 512
  )
    throw new Error("INVALID_SIGNATURE");

  const entries = signature
    .split(",")
    .map((part) => part.trim().split("="));
  if (entries.length !== 2 || entries.some((entry) => entry.length !== 2))
    throw new Error("INVALID_SIGNATURE");
  const parts = Object.fromEntries(entries);
  if (
    !/^\d{10}$|^\d{13}$/.test(parts.ts ?? "") ||
    !/^[a-fA-F0-9]{64}$/.test(parts.v1 ?? "")
  )
    throw new Error("INVALID_SIGNATURE");

  const timestamp =
    Number(parts.ts) * (parts.ts.length === 10 ? 1000 : 1);
  if (Math.abs(Date.now() - timestamp) > 300_000)
    throw new Error("INVALID_SIGNATURE");

  const dataId = ids[0].toLowerCase();
  const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac("sha256", env.MERCADO_PAGO_WEBHOOK_SECRET)
    .update(manifest)
    .digest();
  const actual = Buffer.from(parts.v1, "hex");
  if (actual.length !== expected.length || !timingSafeEqual(expected, actual))
    throw new Error("INVALID_SIGNATURE");
  return dataId;
}
