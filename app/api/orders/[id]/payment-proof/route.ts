import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { handle, sameOrigin } from "@/src/utils/http";
import { customerOrder } from "@/src/orders/service";
import { db, checked, required } from "@/src/db/client";
import { track } from "@/src/analytics";
export const runtime = "nodejs";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    sameOrigin(req);
    const { id } = await params;
    const order = await customerOrder(id);
    if (!["PAYMENT_PENDING", "REJECTED"].includes(order.status))
      throw new Error("CONFLICT");
    if (Number(req.headers.get("content-length")) > 6 * 1024 * 1024)
      throw new Error("INVALID_INPUT");
    const form = await req.formData();
    const file = form.get("proof");
    const reference = String(form.get("reference") || "").trim();
    if (
      !(file instanceof File) ||
      file.size > 5 * 1024 * 1024 ||
      file.size < 12 ||
      reference.length > 100
    )
      throw new Error("INVALID_INPUT");
    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
      ? "image/jpeg"
      : bytes
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        ? "image/png"
        : bytes.toString("ascii", 0, 4) === "RIFF" &&
            bytes.toString("ascii", 8, 12) === "WEBP"
          ? "image/webp"
          : null;
    if (!mime || file.type !== mime) throw new Error("INVALID_INPUT");
    const path = `${id}/${randomUUID()}.${mime.split("/")[1]}`;
    checked(
      await db()
        .storage.from("payment-proofs")
        .upload(path, bytes, { contentType: mime, upsert: false }),
    );
    const changed = required(
      await db()
        .from("orders")
        .update({
          payment_proof_path: path,
          payment_reference: reference || null,
          status: "PAYMENT_REVIEW",
          proof_uploaded_at: new Date().toISOString(),
          proof_deleted_at: null,
        })
        .eq("id", id)
        .in("status", ["PAYMENT_PENDING", "REJECTED"])
        .select("id"),
    );
    if (!changed.length) {
      await db().storage.from("payment-proofs").remove([path]);
      throw new Error("CONFLICT");
    }
    if (order.payment_proof_path)
      await db()
        .storage.from("payment-proofs")
        .remove([order.payment_proof_path]);
    await track("payment_proof_uploaded", id);
    await track("payment_submitted", id);
    return NextResponse.json({ status: "PAYMENT_REVIEW" });
  });
}
