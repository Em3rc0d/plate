import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/db/admin";
import { db, checked } from "@/src/db/client";
import { handle, sameOrigin } from "@/src/utils/http";
import { syncMercadoPagoByProviderId } from "@/src/payments/mercado-pago";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  return handle(async () => {
    sameOrigin(req);
    await requireAdmin();

    const attempts = checked(
      await db()
        .from("payment_attempts")
        .select("id,provider_payment_id")
        .eq("live_mode", true)
        .eq("ever_approved", true)
        .is("provider_net_received_pen", null)
        .not("provider_payment_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(20),
    ) as { id: string; provider_payment_id: string | null }[];

    let synced = 0;
    let failed = 0;

    for (const attempt of attempts) {
      if (!attempt.provider_payment_id) continue;
      try {
        await syncMercadoPagoByProviderId(attempt.provider_payment_id);
        synced++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({
      ok: failed === 0,
      attempted: attempts.length,
      synced,
      failed,
    });
  });
}
