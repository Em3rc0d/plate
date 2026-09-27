import { NextResponse } from "next/server";
import { z } from "zod";
import { authClient } from "@/src/db/admin";
import { handle, sameOrigin } from "@/src/utils/http";
import { rateLimit } from "@/src/utils/rate-limit";
export async function POST(req: Request) {
  return handle(async () => {
    sameOrigin(req);
    await rateLimit(req, "admin-login", 10);
    const input = z
      .object({
        email: z.string().email(),
        password: z.string().min(8).max(128),
      })
      .safeParse(await req.json());
    if (!input.success) throw new Error("INVALID_INPUT");
    const auth = await authClient();
    const { data, error } = await auth.auth.signInWithPassword(input.data);
    if (error || data.user?.app_metadata.role !== "admin") {
      await auth.auth.signOut();
      throw new Error("UNAUTHORIZED");
    }
    return NextResponse.json({ ok: true });
  });
}
