import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/src/db/admin";
import { db, required } from "@/src/db/client";
import { handle, sameOrigin } from "@/src/utils/http";
import { deliverReport } from "@/src/reports/delivery";
import { upgradeReport } from "@/src/reports/upgrade";
import type { ReportRow } from "@/src/vehicle/canonical";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    sameOrigin(req);
    await requireAdmin();
    const body = z
      .object({ pdfOnly: z.boolean().default(false) })
      .safeParse(await req.json());
    if (!body.success) throw new Error("INVALID_INPUT");
    const row = required(
      await db()
        .from("reports")
        .select("*")
        .eq("id", (await params).id)
        .single(),
    ) as ReportRow;
    if (!["REPORT_READY", "REPORT_PARTIAL"].includes(row.status))
      throw new Error("CONFLICT");
    row.report_json = upgradeReport(row.report_json);
    const order = required(
      await db().from("orders").select("email").eq("id", row.order_id).single(),
    );
    return NextResponse.json(
      await deliverReport(row, order.email, body.data.pdfOnly),
    );
  });
}
