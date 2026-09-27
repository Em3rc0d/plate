import "server-only";
import { env } from "@/src/config/env";
import { db, checked } from "@/src/db/client";
import { hash } from "@/src/utils/security";
import { capture } from "@/src/observability";
import { track } from "@/src/analytics";
import type { Section } from "@/src/vehicle/canonical";
import { obj, str, num, type ProviderResult } from "./types";
interface Config {
  provider: string;
  endpoint: string;
  key: string;
  section: Section;
  source: string;
  cost: number;
  bearer?: boolean;
}
export async function call(
  config: Config,
  plate: string,
  queryId: string | null,
): Promise<ProviderResult> {
  const now = new Date().toISOString();
  const base: ProviderResult = {
    provider: config.provider,
    endpoint: config.endpoint,
    section: config.section,
    status: "NOT_CONFIGURED",
    data: {},
    checkedAt: now,
    originalSource: config.source,
    cost: 0,
  };
  // Global TEST firewall: includes previews, admin probes and report retries.
  // Return before fetch, retries, analytics or provider_calls insertion.
  if (!env.MERCADO_PAGO_LIVE_MODE)
    return {
      ...base,
      status: "UNAVAILABLE",
      errorCode: "PAYMENT_TEST_MODE_BLOCKED",
    };
  if (!env.VEHICLE_PROVIDER_EXECUTION_ENABLED)
    return {
      ...base,
      status: "UNAVAILABLE",
      errorCode: "PROVIDER_EXECUTION_DISABLED",
    };
  if (!config.key) return base;
  let last = base;
  for (let attempt = 0; attempt < 2; attempt++) {
    const started = Date.now();
    let httpStatus: number | undefined;
    let retry = false;
    let retryMs = 250;
    try {
      const response = await fetch(config.endpoint.replace("{PLATE}", plate), {
        method: config.bearer ? "GET" : "POST",
        headers: config.bearer
          ? { Authorization: `Bearer ${config.key}` }
          : { "x-api-key": config.key, "Content-Type": "application/json" },
        body: config.bearer ? undefined : JSON.stringify({ placa: plate }),
        signal: AbortSignal.timeout(12000),
        cache: "no-store",
      });
      httpStatus = response.status;
      if (!response.ok) {
        retry = response.status >= 500;
        const delay = Number(response.headers.get("retry-after"));
        if (
          response.status === 429 &&
          Number.isFinite(delay) &&
          delay > 0 &&
          delay <= 2
        ) {
          retry = true;
          retryMs = delay * 1000;
        }
        last = {
          ...base,
          status: "UNAVAILABLE",
          errorCode: `HTTP_${response.status}`,
          cost: config.cost,
        };
      } else {
        const raw = obj(await response.json());
        const status = str(raw, "status", "estado");
        const rejected =
          raw.success === false ||
          raw.error === true ||
          ["error", "failed"].includes(status || "");
        let data = obj(raw.data ?? raw.datos ?? raw.resultado ?? raw);
        if (Array.isArray(raw.data)) data = obj(raw.data[0]);
        if (data.result && typeof data.result === "object")
          data = obj(data.result);
        last = {
          ...base,
          status: rejected
            ? "UNAVAILABLE"
            : status === "no_encontrado"
              ? "NOT_FOUND"
              : "VERIFIED",
          data,
          sourceTimestamp: str(raw, "fetchedAt"),
          cost:
            config.provider === "PlacApi"
              ? (num(raw, "cost") ?? 1) * env.PLACAPI_COST_PER_CREDIT_PEN
              : config.cost,
          errorCode: rejected ? "PROVIDER_REJECTED" : undefined,
        };
      }
    } catch {
      retry = true;
      last = {
        ...base,
        status: "UNAVAILABLE",
        errorCode: "NETWORK_TIMEOUT_OR_INVALID_JSON",
        cost: config.cost,
      };
    }
    if (queryId) {
      checked(
        await db()
          .from("provider_calls")
          .insert({
            query_id: queryId,
            provider: config.provider,
            endpoint: config.endpoint.replace("{PLATE}", "[plate]"),
            request_fingerprint: hash(plate + config.endpoint),
            status: last.status,
            http_status: httpStatus,
            latency_ms: Date.now() - started,
            cost_pen: last.cost,
            error_code: last.errorCode,
          }),
      );
    }
    if (last.status === "UNAVAILABLE") {
      capture("provider_failed", {
        provider: config.provider,
        endpoint: config.section,
      });
      if (queryId)
        await track("provider_failed", queryId, {
          provider: config.provider,
          section: config.section,
        });
    }
    if (!retry || attempt === 1) return last;
    await new Promise((resolve) => setTimeout(resolve, retryMs));
  }
  return last;
}
