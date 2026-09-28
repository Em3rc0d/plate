import "server-only";
import { cookies } from "next/headers";
import { db, checked, required } from "@/src/db/client";
import { matchesToken, hash, token } from "@/src/utils/security";
import { env, mercadoPagoConfigured } from "@/src/config/env";
import { requireAdmin } from "@/src/db/admin";
import { commercialReadiness } from "@/src/config/commercial";
import type { OrderRow } from "@/src/vehicle/canonical";
export async function customerOrder(id: string) {
  const order = checked(
    await db().from("orders").select("*").eq("id", id).maybeSingle(),
  ) as OrderRow | null;
  if (!order) throw new Error("NOT_FOUND");

  const value = (await cookies()).get(`order_${id}`)?.value;
  if (value && matchesToken(value, order.access_token_hash)) return order;

  // Admins may inspect/recover the customer payment page without rotating the
  // customer's access token. This is especially useful across Vercel preview
  // hostnames, where the original order cookie is host-scoped.
  if (await requireAdmin().then(() => true).catch(() => false)) return order;

  throw new Error("NOT_FOUND");
}
export async function createOrder(input: {
  plate: string;
  email: string;
  phone: string;
  method: "MP_YAPE" | "MP_CARD" | "YAPE" | "PLIN";
}) {
  if (!commercialReadiness().ready)
    throw new Error("SERVICE_NOT_CONFIGURED");
  if (
    !env.YAPE_CHECKOUT_ENABLED &&
    (input.method === "MP_YAPE" || input.method === "YAPE")
  )
    throw new Error("PAYMENT_METHOD_DISABLED");
  if (input.method.startsWith("MP_")) {
    if (!mercadoPagoConfigured) throw new Error("PAYMENT_NOT_CONFIGURED");
  } else {
    const phone = input.method === "YAPE" ? env.YAPE_PHONE : env.PLIN_PHONE;
    const name =
      input.method === "YAPE" ? env.YAPE_DISPLAY_NAME : env.PLIN_DISPLAY_NAME;
    if (!phone || !name) throw new Error("PAYMENT_NOT_CONFIGURED");
  }
  const access = token();
  const order = required(
    await db()
      .from("orders")
      .insert({
        plate: input.plate,
        email: input.email,
        phone: input.phone,
        payment_method: input.method,
        amount_pen: env.REPORT_PRICE_PEN,
        access_token_hash: hash(access),
        terms_version: env.TERMS_VERSION,
        privacy_version: env.PRIVACY_VERSION,
        accepted_at: new Date().toISOString(),
      })
      .select("id")
      .single(),
  );
  (await cookies()).set(`order_${order.id}`, access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 86400 * 7,
    path: "/",
  });
  return order;
}
export interface PaymentProvider {
  approve(orderId: string, adminId: string): Promise<boolean>;
}
export const manualPayment: PaymentProvider = {
  async approve(orderId, adminId) {
    return (
      checked(
        await db().rpc("approve_order", { p_id: orderId, p_admin: adminId }),
      ) === true
    );
  },
};
