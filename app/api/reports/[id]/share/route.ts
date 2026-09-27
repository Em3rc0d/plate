import { NextResponse } from "next/server";
import { publicReport } from "@/src/reports/repository";
import { handle, sameOrigin } from "@/src/utils/http";
import { db, checked, required } from "@/src/db/client";
import { token } from "@/src/utils/security";
import { env } from "@/src/config/env";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    sameOrigin(req);
    const row = await publicReport((await params).id);
    if (!row) throw new Error("NOT_FOUND");
    if (!row.share_code)
      checked(
        await db()
          .from("reports")
          .update({ share_code: token() })
          .eq("id", row.id)
          .is("share_code", null),
      );
    const current = required(
      await db().from("reports").select("share_code").eq("id", row.id).single(),
    );
    return NextResponse.json(
      { url: `${env.NEXT_PUBLIC_SITE_URL}/compartir/${current.share_code}` },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  });
}
