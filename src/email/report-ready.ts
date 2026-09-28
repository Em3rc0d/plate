import "server-only";
import { Resend } from "resend";
import { env } from "@/src/config/env";
import { legalNotice } from "@/src/config/product";
import type { ReportRow } from "@/src/vehicle/canonical";

function classifyResendError(error: unknown) {
  const candidate =
    error && typeof error === "object"
      ? (error as { name?: unknown; message?: unknown })
      : {};
  const name = typeof candidate.name === "string" ? candidate.name : "";
  const message =
    typeof candidate.message === "string" ? candidate.message : "";
  const value = `${name} ${message}`.toLowerCase();

  if (value.includes("domain") && value.includes("verif"))
    return "RESEND_DOMAIN_NOT_VERIFIED";
  if (
    value.includes("testing email") ||
    value.includes("own email") ||
    value.includes("test recipient")
  )
    return "RESEND_TEST_RECIPIENT_RESTRICTED";
  if (
    value.includes("api key") &&
    (value.includes("invalid") ||
      value.includes("restricted") ||
      value.includes("permission"))
  )
    return "RESEND_API_KEY_REJECTED";
  if (value.includes("rate limit") || value.includes("too many"))
    return "RESEND_RATE_LIMITED";
  if (value.includes("from") && value.includes("invalid"))
    return "RESEND_FROM_REJECTED";
  if (
    (value.includes("recipient") || value.includes("to")) &&
    value.includes("invalid")
  )
    return "RESEND_RECIPIENT_REJECTED";

  const safeName = name
    .toUpperCase()
    .replace(/[^A-Z0-9_]+/g, "_")
    .slice(0, 40);
  return safeName ? `RESEND_${safeName}` : "RESEND_REJECTED";
}

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
  if (error) throw new Error(classifyResendError(error));
}
