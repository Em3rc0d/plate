import "server-only";
import * as Sentry from "@sentry/nextjs";
export function capture(code: string, tags: Record<string, string> = {}) {
  Sentry.captureMessage(code, { level: "error", tags });
  console.error(JSON.stringify({ code, ...tags }));
}
