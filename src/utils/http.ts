import "server-only";
import { NextResponse } from "next/server";
import { env } from "@/src/config/env";
import { capture } from "@/src/observability";
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (origin !== new URL(env.NEXT_PUBLIC_SITE_URL).origin)
    throw new Error("FORBIDDEN");
}
export async function handle(fn: () => Promise<Response>) {
  try {
    return await fn();
  } catch (e) {
    const code = e instanceof Error ? e.message : "INTERNAL";
    const status =
      code === "PDF_EXPIRED"
        ? 410
        : ["UNAUTHORIZED", "INVALID_SIGNATURE"].includes(code)
          ? 401
          : code === "FORBIDDEN"
            ? 403
            : code === "NOT_FOUND"
              ? 404
              : code === "RATE_LIMIT"
                ? 429
                : code.includes("NOT_CONFIGURED")
                  ? 503
                  : [
                        "CONFLICT",
                        "PAYMENT_METHOD_MISMATCH",
                        "IDEMPOTENCY_CONFLICT",
                        "PAYMENT_ALREADY_ACTIVE",
                      ].includes(code)
                    ? 409
                    : [
                          "INVALID_INPUT",
                          "INVALID_IDEMPOTENCY_KEY",
                          "INVALID_TOKEN",
                          "INVALID_INSTRUMENT",
                        ].includes(code)
                      ? 400
                      : ["PROVIDER_UNAVAILABLE", "PAYMENT_RESULT_UNKNOWN"].includes(
                            code,
                          )
                        ? 503
                        : 500;
    if (status === 500) capture("route_failure");
    return NextResponse.json(
      {
        error:
          status === 500
            ? "No se pudo completar la operación. Intenta nuevamente."
            : code,
      },
      { status },
    );
  }
}
