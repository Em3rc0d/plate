import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/db/admin";
import { diagnoseMercadoPagoTestCredentials } from "@/src/payments/mercado-pago";
import { handle } from "@/src/utils/http";

export const runtime = "nodejs";

// Read-only, admin-only, TEST-only. Never creates a payment or contacts vehicle providers.
export async function GET() {
  return handle(async () => {
    await requireAdmin();
    return NextResponse.json(await diagnoseMercadoPagoTestCredentials(), {
      headers: { "Cache-Control": "private, no-store" },
    });
  });
}
