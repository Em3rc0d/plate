import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, sameOrigin } from "@/src/utils/http";
import { track } from "@/src/analytics";
import { rateLimit } from "@/src/utils/rate-limit";
import { databaseConfigured } from "@/src/config/env";

const browserEvents = z.enum([
  "landing_view",
  "plate_submitted",
  "preview_success",
  "preview_failed",
  "checkout_started",
  "payment_method_selected",
  "payment_submitted",
  "payment_approved",
  "report_ready",
  "report_viewed",
  "pdf_downloaded",
  "report_shared",
]);

export async function POST(req: Request) {
  return handle(async () => {
    sameOrigin(req);
    if (!databaseConfigured) return new NextResponse(null, { status: 204 });

    const input = z
      .object({
        event: browserEvents,
        id: z.string().uuid(),
        properties: z
          .object({
            method: z
              .enum(["MP_YAPE", "MP_CARD", "YAPE", "PLIN", "yape", "card"])
              .optional(),
            source: z
              .enum(["landing", "preview", "checkout", "payment", "report"])
              .optional(),
            status: z.string().regex(/^[A-Z0-9_-]{1,40}$/).optional(),
          })
          .strict()
          .default({}),
      })
      .safeParse(await req.json());

    if (!input.success) throw new Error("INVALID_INPUT");

    await rateLimit(req, "analytics", 100);
    await track(input.data.event, input.data.id, input.data.properties);
    return new NextResponse(null, { status: 204 });
  });
}
