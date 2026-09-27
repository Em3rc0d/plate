import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/src/db/admin";
import { db, required } from "@/src/db/client";
import { handle, sameOrigin } from "@/src/utils/http";
import { generateVehicleReport } from "@/src/vehicle/service";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    sameOrigin(req);
    await requireAdmin();
    const input = z
      .object({
        forceRefresh: z.boolean().default(false),
        requestId: z.string().uuid(),
      })
      .safeParse(await req.json());
    if (!input.success) throw new Error("INVALID_INPUT");
    const { id } = await params;
    const order = required(
      await db().from("orders").select("*").eq("id", id).single(),
    );
    if (!order.paid_at) throw new Error("CONFLICT");
    const result = await generateVehicleReport({
      plate: order.plate,
      orderId: id,
      recovery: true,
      forceRefresh: input.data.forceRefresh,
      requestId: input.data.requestId,
    });
    return NextResponse.json(result, {
      status: result.status === "UNCHANGED" ? 409 : 200,
    });
  });
}
