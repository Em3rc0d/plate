import { upgradeReport } from "./upgrade";
import "server-only";
import { randomUUID } from "node:crypto";
import { db, checked, required } from "@/src/db/client";
import { env } from "@/src/config/env";
import { sendReport } from "@/src/email/report-ready";
import { capture } from "@/src/observability";
import type { ReportRow } from "@/src/vehicle/canonical";
export async function deliverReport(
  row: ReportRow,
  email: string,
  pdfOnly = false,
  forceEmail = false,
) {
  const id = randomUUID();
  const claimed = checked(
    await db().rpc("claim_delivery", {
      p_id: row.id,
      p_revision: row.revision,
      p_token: id,
    }),
  );
  if (!claimed) return { status: "DELIVERY_IN_PROGRESS" };
  try {
    row = required(
      await db().from("reports").select("*").eq("id", row.id).single(),
    ) as ReportRow;
    row.report_json = upgradeReport(row.report_json);
    try {
      // Keep PDFKit out of unrelated payment/report imports and load it only
      // when a PDF is actually being generated. This also makes packaging
      // failures catchable instead of crashing the whole serverless process.
      const { generatePdf } = await import("./pdf-service");
      await generatePdf(row);
    } catch (error) {
      capture("pdf_failure", { report_id: row.id });
      checked(
        await db()
          .from("reports")
          .update({
            pdf_status:
              row.pdf_deleted_at ||
              (error instanceof Error && error.message === "PDF_EXPIRED")
                ? "EXPIRED"
                : "FAILED",
          })
          .eq("id", row.id)
          .eq("revision", row.revision),
      );
    }
    let emailStatus: ReportRow["email_status"] = row.email_status;
    let emailError: string | null = null;
    if (!pdfOnly && (forceEmail || row.email_status !== "SENT")) {
      let status: ReportRow["email_status"] = "NOT_CONFIGURED";
      if (env.RESEND_API_KEY && env.REPORT_FROM_EMAIL) {
        try {
          await sendReport(
            row,
            email,
            forceEmail
              ? `report-${row.id}-v${row.revision}-manual-${id}`
              : undefined,
          );
          status = "SENT";
        } catch (error) {
          const reason =
            error instanceof Error && error.message.startsWith("RESEND_")
              ? error.message
              : "EMAIL_FAILED";
          capture("email_failure", { report_id: row.id, reason });
          emailError = reason;
          status = "FAILED";
        }
      }
      checked(
        await db()
          .from("reports")
          .update({ email_status: status })
          .eq("id", row.id)
          .eq("revision", row.revision),
      );
      emailStatus = status;
    }
    return {
      status: "DELIVERY_ATTEMPTED",
      emailStatus,
      emailError,
    };
  } finally {
    checked(
      await db()
        .from("reports")
        .update({
          delivery_token: null,
          delivery_started_at: null,
          delivery_attempted_at: new Date().toISOString(),
        })
        .eq("id", row.id)
        .eq("delivery_token", id),
    );
  }
}
