import "server-only";
import { PostHog } from "posthog-node";
import { env } from "@/src/config/env";
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
export async function track(
  event: string,
  id: string,
  properties: Record<string, string | number> = {},
) {
  if (!allowed.has(event) || !env.NEXT_PUBLIC_POSTHOG_KEY) return;
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
