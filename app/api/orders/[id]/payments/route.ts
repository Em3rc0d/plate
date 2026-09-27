import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, sameOrigin } from "@/src/utils/http";
import { customerOrder } from "@/src/orders/service";
import { rateLimit } from "@/src/utils/rate-limit";
import { createMercadoPagoPayment } from "@/src/payments/mercado-pago";
import { track } from "@/src/analytics";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    sameOrigin(req);
    await rateLimit(req, "payments", 10);
    const { id } = await params;
    const order = await customerOrder(id);
    if (!["MP_YAPE", "MP_CARD"].includes(order.payment_method))
      throw new Error("PAYMENT_METHOD_MISMATCH");
    if (!["PAYMENT_PENDING", "REJECTED"].includes(order.status))
      throw new Error("CONFLICT");

    const input = z
      .object({
        idempotencyKey: z.string().min(8).max(160),
        instrument: z
          .object({
            token: z.string().min(1).max(4096),
            paymentMethodId: z.string().min(2).max(80),
            installments: z.literal(1).default(1),
            issuerId: z.string().min(1).max(80).optional(),
          })
          .strict(),
      })
      .safeParse(await req.json());
    if (!input.success) throw new Error("INVALID_INPUT");

    if (
      (order.payment_method === "MP_YAPE" &&
        input.data.instrument.paymentMethodId !== "yape") ||
      (order.payment_method === "MP_CARD" &&
        input.data.instrument.paymentMethodId === "yape")
    )
      throw new Error("PAYMENT_METHOD_MISMATCH");

    const payment = await createMercadoPagoPayment(
      order,
      input.data.instrument,
      input.data.idempotencyKey,
    );

    let report: { status: string; reportId?: string } | undefined;
    if (payment.shouldFulfill) {
      await track("payment_approved", order.id, {
        provider: "mercadopago",
        method: input.data.instrument.paymentMethodId,
      });
      const { generateVehicleReport } = await import("@/src/vehicle/service");
      report = await generateVehicleReport({
        plate: order.plate,
        orderId: order.id,
      });
    }

    return NextResponse.json(
      { payment, report },
      { status: payment.status === "CREATING" ? 202 : 200 },
    );
  });
}
