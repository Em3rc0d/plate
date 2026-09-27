import "server-only";
import { env } from "@/src/config/env";
import { db, checked } from "@/src/db/client";
import { hash } from "./security";
export async function rateLimit(req: Request, scope: string, limit: number) {
  const ip =
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    "shared-local";
  const allowed = checked(
    await db().rpc("consume_rate_limit", {
      p_hash: hash(
        (env.RATE_LIMIT_SALT || env.SUPABASE_SERVICE_ROLE_KEY) + scope + ip,
      ),
      p_limit: limit,
    }),
  );
  if (!allowed) throw new Error("RATE_LIMIT");
}
