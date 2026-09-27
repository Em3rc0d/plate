import { registryProviders } from "@/src/providers/router";
import { supports } from "@/src/config/providers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, sameOrigin } from "@/src/utils/http";
import { normalizePlate } from "@/src/vehicle/normalize-plate";
import { env, databaseConfigured } from "@/src/config/env";
import { db, checked, required } from "@/src/db/client";
import { rateLimit } from "@/src/utils/rate-limit";
import { vehicle } from "@/src/providers/identity/placapi-vehicle";
import { buildEvidence } from "@/src/evidence/engine";
import { track } from "@/src/analytics";
export const runtime = "nodejs";
export async function POST(req: Request) {
  return handle(async () => {
    sameOrigin(req);
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
    const base = {
      plate,
      price: env.REPORT_PRICE_PEN,
      availableSources: {
        registry: supports("REGISTRY_CURRENT_OWNER"),
        insurance: supports("SOAT"),
        inspection: supports("CITV"),
        fines: supports("FINES_NATIONAL"),
        identity: supports("IDENTITY"),
      },
    };
    if (!databaseConfigured)
      return NextResponse.json({ ...base, status: "NOT_CONFIGURED" });
    if (env.PREVIEW_PROVIDER_MODE === "NONE")
      return NextResponse.json({
        ...base,
        status: "READY",
        previewMode: "NONE",
      });
    const cache = checked(
      await db()
        .from("preview_cache")
        .select("*")
        .eq("plate", plate)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle(),
    );
    if (cache) return NextResponse.json({ ...base, ...cache.data });
    await rateLimit(req, "preview", 3);
    if (env.PREVIEW_PROVIDER_MODE === "BASIC" && !env.PLACAPI_API_KEY)
      return NextResponse.json({
        ...base,
        status: "READY",
        previewMode: "BASIC_NO_PROVIDER",
      });
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
    const results =
      env.PREVIEW_PROVIDER_MODE === "FULL"
        ? await registryProviders(plate, query.id)
        : [await vehicle(plate, query.id)];
    const result = results[0];
    const report = buildEvidence(plate, results);
    const data = {
      brand: report.identity.brand,
      model: report.identity.model,
      status: report.identity.brand
        ? "VERIFIED"
        : result.status === "VERIFIED"
          ? "UNAVAILABLE"
          : result.status,
    };
    checked(
      await db()
        .from("vehicle_queries")
        .update({
          status: data.status === "VERIFIED" ? "COMPLETED" : "PARTIAL",
          completed_at: new Date().toISOString(),
          total_data_cost_pen: required(
            await db()
              .from("provider_calls")
              .select("cost_pen")
              .eq("query_id", query.id),
          ).reduce((sum, row) => sum + Number(row.cost_pen), 0),
        })
        .eq("id", query.id),
    );
    if (["VERIFIED", "NOT_FOUND"].includes(data.status))
      checked(
        await db()
          .from("preview_cache")
          .upsert({
            plate,
            data,
            expires_at: new Date(Date.now() + 3600000).toISOString(),
          }),
      );
    await track(
      data.status === "VERIFIED" ? "preview_success" : "preview_failed",
      query.id,
    );
    return NextResponse.json({ ...base, ...data });
  });
}
