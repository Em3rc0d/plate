import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/db/admin";
import { handle } from "@/src/utils/http";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  return handle(async () => {
    await requireAdmin();
    const { renderPdfRuntimeSmoke } = await import(
      "@/src/reports/pdf-runtime-smoke"
    );
    const buffer = await renderPdfRuntimeSmoke();
    return NextResponse.json({
      ok: true,
      bytes: buffer.length,
      providerExecution: false,
    });
  });
}
