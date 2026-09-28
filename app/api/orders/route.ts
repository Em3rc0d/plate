import { env } from "@/src/config/env";
import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, sameOrigin } from "@/src/utils/http";
import { normalizePlate } from "@/src/vehicle/normalize-plate";
import { createOrder } from "@/src/orders/service";
import { rateLimit } from "@/src/utils/rate-limit";
import { track } from "@/src/analytics";
export async function POST(req: Request) {
  return handle(async () => {
    sameOrigin(req);
    const input = z
      .object({
        plate: z.string().max(20),
        email: z.string().email().max(254),
        phone: z.string().regex(/^\+?[0-9 ()-]{7,20}$/),
        method: z.enum(["MP_YAPE", "MP_CARD", "YAPE", "PLIN"]),
        accepted: z.literal(true),
        termsVersion: z.literal(env.TERMS_VERSION),
        privacyVersion: z.literal(env.PRIVACY_VERSION),
        analyticsId: z.string().uuid().optional(),
      })
      .safeParse(await req.json());
    if (!input.success) throw new Error("INVALID_INPUT");
    await rateLimit(req, "orders", env.MERCADO_PAGO_LIVE_MODE ? 10 : 100);
    let plate: string;
    try {
      plate = normalizePlate(input.data.plate);
    } catch {
      throw new Error("INVALID_INPUT");
    }
    const order = await createOrder({ ...input.data, plate });
    await track("checkout_started", input.data.analyticsId || order.id, {
      source: "checkout",
      method: input.data.method,
    });
    return NextResponse.json(order, { status: 201 });
  });
}
