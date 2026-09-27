import "server-only";
import { Resend } from "resend";
import { env } from "@/src/config/env";
import { legalNotice } from "@/src/config/product";
import type { ReportRow } from "@/src/vehicle/canonical";
export async function sendReport(row: ReportRow, email: string) {
  if (!env.RESEND_API_KEY || !env.REPORT_FROM_EMAIL)
    throw new Error("EMAIL_NOT_CONFIGURED");
  const url = `${env.NEXT_PUBLIC_SITE_URL}/reporte/${row.public_code}`;
  const { error } = await new Resend(env.RESEND_API_KEY).emails.send(
    {
      from: env.REPORT_FROM_EMAIL,
      to: email,
      subject: `Tu reporte vehicular de ${row.report_json.identity.plate} está listo`,
      text: `Tu reporte ${row.status === "REPORT_PARTIAL" ? "parcial" : "completo"} está disponible.\nPlaca: ${row.report_json.identity.plate}\nGenerado: ${row.created_at}\nVer reporte: ${url}\nDescargar PDF: ${env.NEXT_PUBLIC_SITE_URL}/api/reports/${row.public_code}/pdf\n\n${legalNotice}`,
    },
    { idempotencyKey: `report-${row.id}-v${row.revision}` },
  );
  if (error) throw new Error("EMAIL_FAILED");
}
