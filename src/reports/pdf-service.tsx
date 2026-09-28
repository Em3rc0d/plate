import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { db, checked, required } from "@/src/db/client";
import { PdfDocument } from "./pdf-document";
import type { ReportRow } from "@/src/vehicle/canonical";
import { env } from "@/src/config/env";
export async function generatePdf(row: ReportRow, force = false) {
  if (
    row.pdf_deleted_at ||
    (env.REPORT_RETENTION_DAYS &&
      Date.parse(row.created_at) + env.REPORT_RETENTION_DAYS * 86400000 <
        Date.now())
  )
    throw new Error("PDF_EXPIRED");
  if (row.pdf_path && !force) {
    const existing = await db()
      .storage.from("report-pdfs")
      .download(row.pdf_path);
    if (!existing.error) {
      if (row.pdf_status !== "READY")
        checked(
          await db()
            .from("reports")
            .update({ pdf_status: "READY" })
            .eq("id", row.id)
            .eq("revision", row.revision),
        );
      return row.pdf_path;
    }
    const code = String(
      (existing.error as { statusCode?: string; status?: number }).statusCode ??
        (existing.error as { status?: number }).status ??
        "",
    );
    if (!["404", "400"].includes(code))
      throw new Error("PDF_STORAGE_UNAVAILABLE");
  }

  const buffer = await renderToBuffer(<PdfDocument row={row} />);
  const path = `${row.id}/report-v${row.revision}.pdf`;
  checked(
    await db()
      .storage.from("report-pdfs")
      .upload(path, buffer, { contentType: "application/pdf", upsert: true }),
  );
  const changed = required(
    await db()
      .from("reports")
      .update({ pdf_path: path, pdf_status: "READY" })
      .eq("id", row.id)
      .eq("revision", row.revision)
      .is("pdf_deleted_at", null)
      .select("id"),
  );
  if (!changed.length) {
    await db().storage.from("report-pdfs").remove([path]);
    throw new Error("CONFLICT");
  }
  return path;
}
