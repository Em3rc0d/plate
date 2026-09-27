import { NextResponse } from "next/server";
import { handle } from "@/src/utils/http";
import {
  syncMercadoPagoByProviderId,
  verifyMercadoPagoWebhook,
} from "@/src/payments/mercado-pago";
import { db, checked } from "@/src/db/client";
import { generateVehicleReport } from "@/src/vehicle/service";
import { track } from "@/src/analytics";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  return handle(async () => {
    const providerId = verifyMercadoPagoWebhook(req);
    const payment = await syncMercadoPagoByProviderId(providerId);
    if (!payment) return NextResponse.json({ received: true, matched: false });

    if (payment.shouldFulfill) {
      const attempt = checked(
        await db()
          .from("payment_attempts")
          .select("order_id")
          .eq("id", payment.attemptId)
          .single(),
      );
      const order = checked(
        await db()
          .from("orders")
          .select("id,plate")
          .eq("id", attempt.order_id)
          .single(),
      );
      await track("payment_approved", order.id, {
        provider: "mercadopago",
        source: "webhook",
      });
      await generateVehicleReport({ plate: order.plate, orderId: order.id });
    }

    return NextResponse.json({ received: true, matched: true });
  });
}
