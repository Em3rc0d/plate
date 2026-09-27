import { NextResponse } from "next/server";
import { z } from "zod";
import { db, required } from "@/src/db/client";
import { handle, sameOrigin } from "@/src/utils/http";
import { rateLimit } from "@/src/utils/rate-limit";

const schema = z.object({
  kind: z.enum(["RECLAMO", "QUEJA"]),
  consumerName: z.string().trim().min(2).max(160),
  documentType: z.enum(["DNI", "CE", "PASAPORTE", "RUC"]),
  documentNumber: z.string().trim().min(5).max(20),
  address: z.string().trim().min(5).max(240),
  email: z.string().email().max(254),
  phone: z.string().trim().min(7).max(20),
  isMinor: z.boolean(),
  representativeName: z.string().trim().max(160).optional().default(""),
  representativeDocument: z.string().trim().max(20).optional().default(""),
  itemType: z.literal("SERVICIO"),
  itemDescription: z.string().trim().min(3).max(240),
  amountPen: z.number().finite().min(0).max(9999999),
  detail: z.string().trim().min(10).max(4000),
  request: z.string().trim().min(3).max(2000),
  responseChannel: z.enum(["EMAIL", "DOMICILIO"]),
  accepted: z.literal(true),
});

export async function POST(req: Request) {
  return handle(async () => {
    sameOrigin(req);
    await rateLimit(req, "consumer-claims", 5);
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) throw new Error("INVALID_INPUT");
    const input = parsed.data;
    if (input.isMinor && (!input.representativeName || !input.representativeDocument)) throw new Error("INVALID_INPUT");
    const row = required(await db().from("consumer_claims").insert({
      kind: input.kind,
      consumer_name: input.consumerName,
      document_type: input.documentType,
      document_number: input.documentNumber,
      address: input.address,
      email: input.email,
      phone: input.phone,
      is_minor: input.isMinor,
      representative_name: input.representativeName || null,
      representative_document: input.representativeDocument || null,
      item_type: input.itemType,
      item_description: input.itemDescription,
      amount_pen: input.amountPen,
      detail: input.detail,
      consumer_request: input.request,
      response_channel: input.responseChannel,
    }).select("claim_number,created_at").single());
    return NextResponse.json({ code: `PC-${String(row.claim_number).padStart(6, "0")}`, createdAt: row.created_at }, { status: 201 });
  });
}
