import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, sameOrigin } from "@/src/utils/http";
import { track } from "@/src/analytics";
import { rateLimit } from "@/src/utils/rate-limit";
import { databaseConfigured } from "@/src/config/env";
export async function POST(req: Request) {
  return handle(async () => {
    sameOrigin(req);
    if (!databaseConfigured) return new NextResponse(null, { status: 204 });
    const input = z
      .object({
        event: z.enum([
          "landing_view",
          "plate_submitted",
          "payment_method_selected",
          "report_viewed",
          "report_shared",
        ]),
        id: z.string().uuid(),
        properties: z
          .object({ method: z.enum(["YAPE", "PLIN"]).optional() })
          .default({}),
      })
      .safeParse(await req.json());
    if (!input.success) throw new Error("INVALID_INPUT");
    await rateLimit(req, "analytics", 100);
    await track(input.data.event, input.data.id, input.data.properties);
    return new NextResponse(null, { status: 204 });
  });
}
