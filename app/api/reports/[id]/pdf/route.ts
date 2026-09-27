import { handle } from "@/src/utils/http";
import { publicReport } from "@/src/reports/repository";
import { generatePdf } from "@/src/reports/pdf-service";
import { db, required } from "@/src/db/client";
import { track } from "@/src/analytics";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const { id } = await params;
    const row = await publicReport(id);
    if (!row) throw new Error("NOT_FOUND");
    const path = await generatePdf(row);
    const file = required(
      await db().storage.from("report-pdfs").download(path),
    );
    await track("pdf_downloaded", row.id);
    return new Response(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte-${row.report_json.identity.plate}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex",
      },
    });
  });
}
