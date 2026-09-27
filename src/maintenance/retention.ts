import "server-only";
import { env } from "@/src/config/env";
import { db, checked, required } from "@/src/db/client";
export async function retention(execute = false, includePdfs = false) {
  const now = new Date().toISOString();
  const result = {
    execute,
    proofsEligible: 0,
    pdfsEligible: 0,
    proofsDeleted: 0,
    pdfsDeleted: 0,
    failed: 0,
    limit: 100,
  };
  if (env.PAYMENT_PROOF_RETENTION_DAYS) {
    const cutoff = new Date(
      Date.now() - env.PAYMENT_PROOF_RETENTION_DAYS * 86400000,
    ).toISOString();
    const rows = required(
      await db()
        .from("orders")
        .select("id,payment_proof_path,proof_uploaded_at,created_at")
        .not("payment_proof_path", "is", null)
        .in("status", ["REPORT_READY", "REPORT_PARTIAL", "FAILED", "REJECTED"])
        .or(
          `proof_uploaded_at.lt.${cutoff},and(proof_uploaded_at.is.null,created_at.lt.${cutoff})`,
        )
        .order("created_at")
        .limit(100),
    );
    for (const row of rows) {
      if (
        Date.parse(row.proof_uploaded_at || row.created_at) >=
        Date.parse(cutoff)
      )
        continue;
      result.proofsEligible++;
      if (execute) {
        try {
          checked(
            await db()
              .storage.from("payment-proofs")
              .remove([row.payment_proof_path]),
          );
          checked(
            await db()
              .from("orders")
              .update({ payment_proof_path: null, proof_deleted_at: now })
              .eq("id", row.id)
              .eq("payment_proof_path", row.payment_proof_path),
          );
          result.proofsDeleted++;
        } catch {
          result.failed++;
        }
      }
    }
  }
  if (includePdfs && env.REPORT_RETENTION_DAYS) {
    const cutoff = new Date(
      Date.now() - env.REPORT_RETENTION_DAYS * 86400000,
    ).toISOString();
    const rows = required(
      await db()
        .from("reports")
        .select("id,revision,pdf_path,retired_pdf_paths")
        .lt("created_at", cutoff)
        .is("pdf_deleted_at", null)
        .is("delivery_token", null)
        .limit(100),
    );
    for (const row of rows) {
      const paths = [
        ...(row.retired_pdf_paths || []),
        ...(row.pdf_path ? [row.pdf_path] : []),
      ];
      result.pdfsEligible++;
      if (execute) {
        try {
          const marked = required(
            await db()
              .from("reports")
              .update({ pdf_deleted_at: now, pdf_status: "EXPIRED" })
              .eq("id", row.id)
              .eq("revision", row.revision)
              .is("delivery_token", null)
              .is("pdf_deleted_at", null)
              .select("id"),
          );
          if (!marked.length) continue;
          if (paths.length)
            checked(await db().storage.from("report-pdfs").remove(paths));
          checked(
            await db()
              .from("reports")
              .update({ pdf_path: null, retired_pdf_paths: [] })
              .eq("id", row.id)
              .eq("revision", row.revision),
          );
          result.pdfsDeleted++;
        } catch {
          await db()
            .from("reports")
            .update({ pdf_deleted_at: null, pdf_status: "FAILED" })
            .eq("id", row.id)
            .eq("revision", row.revision);
          result.failed++;
        }
      }
    }
  }
  return result;
}
