import "server-only";
import { PostHog } from "posthog-node";
import { db, checked } from "@/src/db/client";
import { databaseConfigured, env } from "@/src/config/env";

const allowed = new Set([
  "landing_view",
  "plate_submitted",
  "preview_success",
  "preview_failed",
  "checkout_started",
  "payment_method_selected",
  "payment_proof_uploaded",
  "payment_submitted",
  "payment_approved",
  "admin_payment_approved",
  "report_started",
  "provider_failed",
  "report_ready",
  "report_partial",
  "report_viewed",
  "pdf_downloaded",
  "report_shared",
]);

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function track(
  event: string,
  id: string,
  properties: Record<string, string | number> = {},
) {
  if (!allowed.has(event)) return;

  // Keep a first-party, pseudonymous funnel even when PostHog is not enabled.
  // Never put plate, email, phone, document numbers or payment credentials here.
  if (databaseConfigured && uuid.test(id)) {
    try {
      checked(
        await db().from("analytics_events").insert({
          analytics_id: id,
          event,
          properties,
        }),
      );
    } catch {}
  }

  if (!env.NEXT_PUBLIC_POSTHOG_KEY) return;

  try {
    const client = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
      disableGeoip: true,
    });
    client.capture({ distinctId: id, event, properties });
    await client.shutdown();
  } catch {}
}
