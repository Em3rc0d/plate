import { NextResponse } from "next/server";
import { authClient } from "@/src/db/admin";
import { handle, sameOrigin } from "@/src/utils/http";
export async function POST(req: Request) {
  return handle(async () => {
    sameOrigin(req);
    await (await authClient()).auth.signOut();
    return NextResponse.json({ ok: true });
  });
}
