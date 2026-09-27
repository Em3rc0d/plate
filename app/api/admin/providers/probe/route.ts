import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/src/db/admin";
import { handle, sameOrigin } from "@/src/utils/http";
import { db, required, checked } from "@/src/db/client";
import { rateLimit } from "@/src/utils/rate-limit";
import { normalizePlate } from "@/src/vehicle/normalize-plate";
import { providers, type Capability } from "@/src/config/providers";
import { adapters } from "@/src/providers/router";
import { buildEvidence } from "@/src/evidence/engine";
export const runtime = "nodejs";
export const maxDuration = 120;
const fields: Record<Capability, string> = {
  IDENTITY: "identity",
  REGISTRY_CURRENT_OWNER: "registry.currentOwners",
  REGISTRY_HISTORY: "registry.historicalOwners",
  RESTRICTIONS: "registry.restrictions",
  SOAT: "insurance",
  CITV: "inspection",
  FINES_NATIONAL: "fines",
  FINES_LIMA: "fines",
  FINES_CALLAO: "fines",
  THEFT: "theft",
  CAPTURE_ORDERS: "captureOrders",
  CLAIMS: "claims",
  GNV: "gnv",
  VALUATION: "valuation",
};
export async function POST(req: Request) {
  return handle(async () => {
    sameOrigin(req);
    await requireAdmin();
    const input = z
      .object({ plate: z.string().max(20) })
      .safeParse(await req.json());
    if (!input.success) throw new Error("INVALID_INPUT");
    let plate: string;
    try {
      plate = normalizePlate(input.data.plate);
    } catch {
      throw new Error("INVALID_INPUT");
    }
    await rateLimit(req, "admin-probe", 20);
    const query = required(
      await db()
        .from("vehicle_queries")
        .insert({
          plate,
          status: "PROCESSING",
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single(),
    );
    const definitions = providers();
    const settled = await Promise.allSettled(
      definitions.map(async (def) => {
        const result = await adapters[def.id](plate, query.id);
        const report = buildEvidence(plate, [result]);
        const parsed = def.capabilities.filter((cap) =>
          report.evidence.some(
            (e) =>
              (e.fieldPath === fields[cap] ||
                e.fieldPath.startsWith(fields[cap] + ".")) &&
              ["VERIFIED", "NOT_FOUND", "STALE", "CONFLICT"].includes(e.status),
          ),
        );
        return {
          id: def.id,
          provider: def.name,
          alias: def.alias,
          configured: def.configured,
          status: result.status,
          parsedCapabilities: parsed,
          errorCode: result.errorCode ?? null,
          timestamp: result.checkedAt,
          summary: {
            brand: report.identity.brand,
            model: report.identity.model,
            manufactureYear: report.identity.manufactureYear,
            modelYear: report.identity.modelYear,
            owner: def.capabilities.includes("REGISTRY_CURRENT_OWNER")
              ? report.registry.currentOwners.length
                ? "present"
                : "not_returned"
              : "unsupported",
            historyRecords: report.registry.historicalOwners.length,
            ownerIdentityAmbiguous:
              report.registry.ownerIdentityAmbiguous ?? false,
            insurance: def.capabilities.includes("SOAT")
              ? {
                  status: report.evidence.find(
                    (e) => e.fieldPath === "insurance",
                  )?.status,
                  validUntil:
                    report.insurance.current?.validUntil ??
                    report.insurance.history[0]?.validUntil,
                }
              : "unsupported",
            inspection: def.capabilities.includes("CITV")
              ? {
                  status: report.evidence.find(
                    (e) => e.fieldPath === "inspection",
                  )?.status,
                  validUntil:
                    report.inspection.current?.validUntil ??
                    report.inspection.history[0]?.validUntil,
                }
              : "unsupported",
            fines: def.capabilities.includes("FINES_NATIONAL")
              ? {
                  status: report.evidence.find((e) => e.fieldPath === "fines")
                    ?.status,
                  coverage: report.fines.coverage,
                }
              : "unsupported",
          },
          normalizedStatuses: report.evidence
            .filter((e) => !e.metadata.unsupported)
            .map((e) => ({ field: e.fieldPath, status: e.status })),
        };
      }),
    );
    const calls = required(
      await db()
        .from("provider_calls")
        .select(
          "provider,endpoint,http_status,latency_ms,cost_pen,error_code,created_at",
        )
        .eq("query_id", query.id)
        .order("created_at"),
    );
    const rows = settled.map((r, i) => {
      const def = definitions[i];
      const suffix: Record<string, string> = {
        masitaprex: "/v3/consulta/placa",
        consultadatos: "/api/placa/leyenda/[plate]",
        vehicle: "/api/vehiculo-pe",
        insurance: "/api/soat-pe",
        inspection: "/api/revision-tecnica-pe",
        fines: "/api/multas-pe",
      };
      const attempts = calls.filter((c) => c.endpoint.endsWith(suffix[def.id]));
      return {
        ...(r.status === "fulfilled"
          ? r.value
          : {
              id: def.id,
              provider: def.name,
              alias: def.alias,
              configured: def.configured,
              status: "UNAVAILABLE",
              parsedCapabilities: [],
              summary: {},
              normalizedStatuses: [],
              errorCode: "PROBE_FAILED",
              timestamp: new Date().toISOString(),
            }),
        httpStatus: attempts.at(-1)?.http_status ?? null,
        latencyMs: attempts.reduce((s, c) => s + Number(c.latency_ms), 0),
        costPen: attempts.reduce((s, c) => s + Number(c.cost_pen), 0),
        attempts: attempts.length,
      };
    });
    checked(
      await db()
        .from("vehicle_queries")
        .update({
          status: rows.some((r) => r.status === "VERIFIED")
            ? "COMPLETED"
            : "PARTIAL",
          completed_at: new Date().toISOString(),
          total_data_cost_pen: calls.reduce(
            (s, c) => s + Number(c.cost_pen),
            0,
          ),
        })
        .eq("id", query.id),
    );
    return NextResponse.json(
      { plate, queryId: query.id, rows },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  });
}
