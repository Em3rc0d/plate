import { NextResponse } from "next/server";
import { handle, sameOrigin } from "@/src/utils/http";
import { requireAdmin } from "@/src/db/admin";
import { db, required } from "@/src/db/client";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    sameOrigin(req);
    await requireAdmin();
    const { id } = await params;
    const rows = required(
      await db()
        .from("orders")
        .update({ status: "REJECTED" })
        .eq("id", id)
        .eq("status", "PAYMENT_REVIEW")
        .select("id"),
    );
    if (!rows.length) throw new Error("CONFLICT");
    return NextResponse.json({ status: "REJECTED" });
  });
}
