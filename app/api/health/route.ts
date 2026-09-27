import { NextResponse } from "next/server";
import { databaseConfigured, env } from "@/src/config/env";
import { commercialReadiness } from "@/src/config/commercial";
import { db } from "@/src/db/client";
import pkg from "@/package.json";
export const dynamic = "force-dynamic";
export async function GET() {
  let database = false;
  if (databaseConfigured) {
    try {
      const r = await db()
        .from("orders")
        .select("id,generation_token")
        .limit(1);
      database = !r.error;
    } catch {}
  }
  const commercial = commercialReadiness();
  const payment = commercial.payment;
  const email = !!(env.RESEND_API_KEY && env.REPORT_FROM_EMAIL);
  return NextResponse.json(
    {
      status:
        !database || !commercial.ready
          ? "not_ready"
          : !email
            ? "degraded"
            : "ok",
      database,
      reportProvider: commercial.reportProvider,
      payment,
      email,
      version: pkg.version,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
