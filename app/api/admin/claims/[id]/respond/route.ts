import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, sameOrigin } from "@/src/utils/http";
import { requireAdmin } from "@/src/db/admin";
import { db } from "@/src/db/client";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    sameOrigin(req);
    const admin = await requireAdmin();
    const { id } = await params;
    const input = z.object({ response: z.string().trim().min(3).max(4000), observations: z.string().trim().max(2000).optional().default("") }).safeParse(await req.json());
    if (!input.success) throw new Error("INVALID_INPUT");
    const { data, error } = await db().from("consumer_claims").update({
      status: "ANSWERED", provider_response: input.data.response,
      provider_observations: input.data.observations || null,
      responded_at: new Date().toISOString(), responded_by: admin.id,
    }).eq("id", id).eq("status", "OPEN").select("id").maybeSingle();
    if (error) throw new Error("DATABASE_OPERATION_FAILED");
    if (!data) throw new Error("CONFLICT");
    return NextResponse.json({ ok: true });
  });
}
