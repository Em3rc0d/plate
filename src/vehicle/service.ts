import { upgradeReport } from "@/src/reports/upgrade";
import "server-only";
import { db, checked, required } from "@/src/db/client";
import { normalizePlate } from "./normalize-plate";
import {
  routeProviders,
  refreshDynamicProviders,
} from "@/src/providers/router";
import { buildEvidence } from "@/src/evidence/engine";
import { findings } from "@/src/findings/deterministic";
import { aiSummary } from "@/src/findings/ai-summary";
import { deliverReport } from "@/src/reports/delivery";
export { deliverReport } from "@/src/reports/delivery";
import { env } from "@/src/config/env";

import { token } from "@/src/utils/security";
import { capture } from "@/src/observability";
import { track } from "@/src/analytics";
import type { CanonicalVehicleReport, ReportRow } from "./canonical";

const dynamicSections = new Set(["insurance", "inspection", "fines"]);

function mergeDynamicRefresh(
  existing: CanonicalVehicleReport,
  refreshed: CanonicalVehicleReport,
): CanonicalVehicleReport {
  const report = structuredClone(upgradeReport(existing));
  report.insurance = refreshed.insurance;
  report.inspection = refreshed.inspection;
  report.fines = refreshed.fines;
  report.generatedAt = refreshed.generatedAt;
  report.evidence = [
    ...report.evidence.filter(
      (e) => !dynamicSections.has(e.fieldPath.split(".")[0]),
    ),
    ...refreshed.evidence.filter((e) =>
      dynamicSections.has(e.fieldPath.split(".")[0]),
    ),
  ];
  return upgradeReport(report);
}
export async function generateVehicleReport({
  plate,
  orderId,
  forceRefresh = false,
  recovery = false,
  requestId,
}: {
  plate: string;
  orderId: string;
  forceRefresh?: boolean;
  recovery?: boolean;
  requestId?: string;
}): Promise<{ status: string; reportId?: string }> {
  if (!env.MERCADO_PAGO_LIVE_MODE) throw new Error("PAYMENT_TEST_MODE_BLOCKED");
  if (!env.VEHICLE_PROVIDER_EXECUTION_ENABLED)
    throw new Error("PROVIDER_EXECUTION_DISABLED");
  plate = normalizePlate(plate);
  const database = db();
  const order = required(
    await database.from("orders").select("*").eq("id", orderId).single(),
  );
  if (order.plate !== plate) throw new Error("INVALID_INPUT");
  const existing = checked(
    await database
      .from("reports")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle(),
  ) as ReportRow | null;
  if (existing && !forceRefresh) {
    if (
      recovery &&
      !checked(
        await database.rpc("recover_existing_report", {
          p_id: orderId,
          p_stale_minutes: env.REPORT_PROCESSING_STALE_MINUTES,
        }),
      )
    )
      return { status: "UNCHANGED", reportId: existing.id };
    await deliverReport(existing, order.email);
    return { status: existing.status, reportId: existing.id };
  }
  const attempt = checked(
    await database.rpc("begin_report", {
      p_id: orderId,
      p_recovery: recovery,
      p_force: forceRefresh,
      p_stale_minutes: env.REPORT_PROCESSING_STALE_MINUTES,
      p_request: requestId ?? null,
    }),
  );
  if (!attempt) return { status: "UNCHANGED", reportId: existing?.id };
  let queryId: string | undefined;
  await track("report_started", orderId);
  try {
    const query = required(
      await database
        .from("vehicle_queries")
        .insert({
          plate,
          status: "PROCESSING",
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single(),
    );
    queryId = query.id;
    let report: CanonicalVehicleReport | undefined;
    if (!forceRefresh) {
      const vehicle = checked(
        await database
          .from("vehicles")
          .select("canonical_json")
          .eq("plate", plate)
          .maybeSingle(),
      );
      const cached = vehicle?.canonical_json as
        CanonicalVehicleReport | undefined;
      if (
        cached &&
        cached.evidence.length &&
        cached.evidence.every(
          (e) =>
            (e.metadata.unsupported ||
              ["VERIFIED", "NOT_FOUND"].includes(e.status)) &&
            (e.metadata.unsupported ||
              Date.parse(e.freshnessExpiresAt) > Date.now()),
        )
      )
        report = { ...cached, generatedAt: new Date().toISOString() };
    }
    if (!report) {
      if (forceRefresh && existing) {
        const refreshed = buildEvidence(
          plate,
          await refreshDynamicProviders(plate, query.id),
        );
        report = mergeDynamicRefresh(existing.report_json, refreshed);
      } else {
        report = buildEvidence(plate, await routeProviders(plate, query.id));
      }
    }
    report = upgradeReport(report);
    report.findings = findings(report);
    for (const provider of [
      ...new Set(report.evidence.map((e) => e.provider)),
    ]) {
      const evidence = report.evidence.filter((e) => e.provider === provider);
      for (const section of [
        "registry",
        "identity",
        "insurance",
        "inspection",
        "fines",
      ]) {
        const scoped = evidence.filter(
          (e) =>
            e.fieldPath === section || e.fieldPath.startsWith(section + "."),
        );
        if (!scoped.length) continue;
        const status = scoped.some((e) => e.status === "CONFLICT")
          ? "CONFLICT"
          : scoped.every((e) => e.status === "NOT_FOUND")
            ? "NOT_FOUND"
            : scoped.every((e) => e.status === "UNAVAILABLE")
              ? "UNAVAILABLE"
              : undefined;
        const suffix: Record<string, string> = {
          identity: "vehiculo-pe",
          insurance: "soat-pe",
          inspection: "revision-tecnica-pe",
          fines: "multas-pe",
        };
        if (status && (provider !== "PlacApi" || suffix[section]))
          checked(
            await database
              .from("provider_calls")
              .update({ status })
              .eq("query_id", query.id)
              .eq("provider", provider)
              .like(
                "endpoint",
                provider === "PlacApi" ? `%/${suffix[section]}` : "%",
              )
              .eq("status", "VERIFIED"),
          );
      }
    }
    checked(
      await database
        .from("provider_calls")
        .update({ coverage_json: report.fines.coverage })
        .eq("query_id", query.id)
        .eq("endpoint", "https://placapi.com/api/multas-pe"),
    );
    const meaningful =
      report.evidence.some(
        (e) =>
          ["VERIFIED", "STALE", "CONFLICT"].includes(e.status) &&
          e.value !== null,
      ) || report.evidence.some((e) => e.status === "NOT_FOUND");
    if (!meaningful) throw new Error("ALL_SOURCES_FAILED");
    const evidenceForQuery =
      forceRefresh && existing
        ? report.evidence.filter((e) =>
            dynamicSections.has(e.fieldPath.split(".")[0]),
          )
        : report.evidence;
    checked(
      await database.from("provider_evidence").insert(
        evidenceForQuery.map((e) => ({
          query_id: query.id,
          field_path: e.fieldPath,
          value_json: e.value,
          provider: e.provider,
          original_source: e.originalSource,
          status: e.status,
          checked_at: e.checkedAt,
          freshness_expires_at: e.freshnessExpiresAt,
          metadata_json: e.metadata,
        })),
      ),
    );
    const costs = required(
      await database
        .from("provider_calls")
        .select("cost_pen")
        .eq("query_id", query.id),
    );
    const cost = costs.reduce((s, r) => s + Number(r.cost_pen), 0);
    const partial =
      report.evidence.some(
        (e) =>
          !e.metadata.unsupported &&
          !["VERIFIED", "NOT_FOUND"].includes(e.status),
      ) || Object.values(report.fines.coverage).some((v) => v === "error");
    const status = partial ? "REPORT_PARTIAL" : "REPORT_READY";
    const summary = await aiSummary(report);
    const reportId = checked(
      await database.rpc("commit_report", {
        p_order: orderId,
        p_attempt: attempt,
        p_query: query.id,
        p_code: token(),
        p_report: report,
        p_summary: summary,
        p_cost: cost,
        p_status: status,
      }),
    );
    const row = required(
      await database.from("reports").select("*").eq("id", reportId).single(),
    ) as ReportRow;
    await deliverReport(row, order.email);
    await track(partial ? "report_partial" : "report_ready", orderId);
    return { status, reportId };
  } catch (e) {
    capture("report_failure", { order_id: orderId });
    const committed = checked(
      await database
        .from("reports")
        .select("id,status,query_id")
        .eq("order_id", orderId)
        .maybeSingle(),
    );
    if (queryId && committed?.query_id !== queryId)
      checked(
        await database
          .from("vehicle_queries")
          .update({ status: "FAILED", completed_at: new Date().toISOString() })
          .eq("id", queryId),
      );
    if (committed) {
      if (committed.query_id !== queryId)
        checked(
          await database
            .from("orders")
            .update({
              status: committed.status,
              failure_code: "REFRESH_FAILED_PREVIOUS_REPORT_PRESERVED",
            })
            .eq("id", orderId)
            .eq("generation_token", attempt),
        );
      return { status: committed.status, reportId: committed.id };
    }
    checked(
      await database
        .from("orders")
        .update({
          status: "FAILED",
          failure_code:
            e instanceof Error && e.message === "ALL_SOURCES_FAILED"
              ? "ALL_SOURCES_FAILED"
              : "PIPELINE_FAILED",
        })
        .eq("id", orderId)
        .eq("status", "REPORT_PROCESSING")
        .eq("generation_token", attempt),
    );
    if (queryId)
      checked(
        await database
          .from("vehicle_queries")
          .update({ status: "FAILED", completed_at: new Date().toISOString() })
          .eq("id", queryId),
      );
    return { status: "FAILED" };
  }
}
