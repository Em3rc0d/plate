import { NextResponse } from "next/server";
import { handle, sameOrigin } from "@/src/utils/http";
import { requireAdmin } from "@/src/db/admin";
import { manualPayment } from "@/src/orders/service";
import { db, required } from "@/src/db/client";
import { generateVehicleReport } from "@/src/vehicle/service";
import { track } from "@/src/analytics";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    sameOrigin(req);
    const admin = await requireAdmin();
    const { id } = await params;
    const approved = await manualPayment.approve(id, admin.id);
    if (approved) await track("admin_payment_approved", id);
    const order = required(
      await db().from("orders").select("plate,status").eq("id", id).single(),
    );
    if (
      !["PAID", "REPORT_PROCESSING", "REPORT_READY", "REPORT_PARTIAL"].includes(
        order.status,
      )
    )
      throw new Error("CONFLICT");
    return NextResponse.json(
      await generateVehicleReport({ plate: order.plate, orderId: id }),
    );
  });
}
