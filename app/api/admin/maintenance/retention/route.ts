import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/src/db/admin";
import { handle, sameOrigin } from "@/src/utils/http";
import { retention } from "@/src/maintenance/retention";
export const maxDuration = 120;
export async function POST(req: Request) {
  return handle(async () => {
    sameOrigin(req);
    await requireAdmin();
    const body = z
      .object({
        execute: z.boolean().default(false),
        includePdfs: z.boolean().default(false),
      })
      .safeParse(await req.json());
    if (!body.success) throw new Error("INVALID_INPUT");
    return NextResponse.json(
      await retention(body.data.execute, body.data.includePdfs),
    );
  });
}
