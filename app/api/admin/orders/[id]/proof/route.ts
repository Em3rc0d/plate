import { NextResponse } from "next/server";
import { handle } from "@/src/utils/http";
import { requireAdmin } from "@/src/db/admin";
import { db, required } from "@/src/db/client";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;
    const order = required(
      await db()
        .from("orders")
        .select("payment_proof_path")
        .eq("id", id)
        .single(),
    );
    if (!order.payment_proof_path) throw new Error("NOT_FOUND");
    const signed = required(
      await db()
        .storage.from("payment-proofs")
        .createSignedUrl(order.payment_proof_path, 60),
    );
    return NextResponse.redirect(signed.signedUrl);
  });
}
