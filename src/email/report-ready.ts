import "server-only";
import { Resend } from "resend";
import { env } from "@/src/config/env";
import { legalNotice, productName } from "@/src/config/product";
import { documentarySummary } from "@/src/reports/summary";
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

function escapeHtml(value: string | number | undefined | null) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function limaDate(value: string) {
  return new Date(value).toLocaleString("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildHtml(row: ReportRow, reportUrl: string, pdfUrl: string) {
  const report = row.report_json;
  const stats = documentarySummary(report);
  const partial = row.status === "REPORT_PARTIAL";
  const plate = escapeHtml(report.identity.plate);
  const vehicle = escapeHtml(
    [report.identity.brand, report.identity.model].filter(Boolean).join(" ") ||
      "Vehículo consultado",
  );
  const issued = escapeHtml(limaDate(row.created_at));
  const safeReportUrl = escapeHtml(reportUrl);
  const safePdfUrl = escapeHtml(pdfUrl);
  const safeProductName = escapeHtml(productName);
  const safeLegalNotice = escapeHtml(legalNotice);
  const support = env.SUPPORT_EMAIL
    ? `¿Necesitas ayuda? Escríbenos a <a href="mailto:${escapeHtml(env.SUPPORT_EMAIL)}" style="color:#155C58;text-decoration:none;font-weight:700;">${escapeHtml(env.SUPPORT_EMAIL)}</a>.`
    : "Conserva este correo para volver a acceder a tu reporte.";

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#F6F7F5;font-family:Arial,Helvetica,sans-serif;color:#192D35;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      Tu reporte vehicular de ${plate} ya está disponible.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#F6F7F5;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background:#FFFFFF;border:1px solid #D4DDDC;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;border-bottom:1px solid #D4DDDC;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="font-size:21px;line-height:28px;font-weight:800;color:#155C58;">
                      ${safeProductName}
                    </td>
                    <td align="right" style="font-size:12px;line-height:18px;color:#53646B;">
                      REPORTE VEHICULAR · PERÚ
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:32px 28px 24px;">
                <div style="font-size:13px;line-height:20px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#53646B;margin-bottom:12px;">
                  Tu consulta está lista
                </div>
                <div style="font-size:30px;line-height:38px;font-weight:800;color:#192D35;margin-bottom:8px;">
                  Tu reporte de ${plate} ya está disponible
                </div>
                <div style="font-size:16px;line-height:25px;color:#53646B;">
                  Revisa la evidencia disponible del vehículo en una vista ordenada, con fuentes, fechas y limitaciones claramente separadas.
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#EDF1F0;border:1px solid #D4DDDC;border-radius:10px;">
                  <tr>
                    <td style="padding:22px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td valign="top">
                            <div style="display:inline-block;padding:9px 14px;border:2px solid #192D35;border-radius:6px;background:#FFFFFF;font-family:'Courier New',monospace;font-size:24px;line-height:28px;font-weight:800;letter-spacing:.08em;color:#192D35;">
                              ${plate}
                            </div>
                            <div style="margin-top:12px;font-size:19px;line-height:26px;font-weight:700;color:#192D35;">
                              ${vehicle}
                            </div>
                            <div style="margin-top:4px;font-size:13px;line-height:20px;color:#53646B;">
                              Emitido ${issued} · hora de Lima
                            </div>
                          </td>
                          <td align="right" valign="top" style="padding-left:16px;">
                            <span style="display:inline-block;padding:7px 11px;border-radius:999px;background:${partial ? "#FFF3D9" : "#EAF3ED"};color:${partial ? "#80550D" : "#226348"};font-size:12px;line-height:16px;font-weight:800;">
                              ${partial ? "REPORTE PARCIAL" : "REPORTE DISPONIBLE"}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="33.33%" valign="top" style="padding:14px 10px;border-top:1px solid #D4DDDC;border-bottom:1px solid #D4DDDC;">
                      <div style="font-size:24px;line-height:28px;font-weight:800;color:#192D35;">${stats.completed}</div>
                      <div style="margin-top:4px;font-size:12px;line-height:18px;color:#53646B;">secciones verificadas</div>
                    </td>
                    <td width="33.33%" valign="top" style="padding:14px 10px;border-top:1px solid #D4DDDC;border-bottom:1px solid #D4DDDC;border-left:1px solid #D4DDDC;">
                      <div style="font-size:24px;line-height:28px;font-weight:800;color:#192D35;">${stats.review}</div>
                      <div style="margin-top:4px;font-size:12px;line-height:18px;color:#53646B;">hallazgos para revisar</div>
                    </td>
                    <td width="33.33%" valign="top" style="padding:14px 10px;border-top:1px solid #D4DDDC;border-bottom:1px solid #D4DDDC;border-left:1px solid #D4DDDC;">
                      <div style="font-size:24px;line-height:28px;font-weight:800;color:#192D35;">${stats.unavailable}</div>
                      <div style="margin-top:4px;font-size:12px;line-height:18px;color:#53646B;">secciones parciales</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            ${partial ? `
            <tr>
              <td style="padding:0 28px 24px;">
                <div style="padding:14px 16px;border-left:4px solid #80550D;background:#FFF8E8;border-radius:6px;font-size:13px;line-height:20px;color:#5D481C;">
                  <strong>¿Por qué dice “parcial”?</strong><br />
                  Algunas fuentes o campos no estuvieron disponibles en esta consulta. El reporte distingue esos casos para no presentarlos como ausencia de antecedentes.
                </div>
              </td>
            </tr>
            ` : ""}

            <tr>
              <td style="padding:0 28px 30px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding-right:10px;padding-bottom:10px;">
                      <a href="${safeReportUrl}" style="display:inline-block;background:#155C58;color:#FFFFFF;text-decoration:none;font-size:15px;line-height:20px;font-weight:800;padding:13px 20px;border-radius:7px;">
                        Ver reporte
                      </a>
                    </td>
                    <td style="padding-bottom:10px;">
                      <a href="${safePdfUrl}" style="display:inline-block;background:#FFFFFF;color:#155C58;text-decoration:none;font-size:15px;line-height:20px;font-weight:800;padding:12px 19px;border:1px solid #788984;border-radius:7px;">
                        Descargar PDF
                      </a>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:8px;font-size:12px;line-height:18px;color:#53646B;">
                  El enlace del reporte es privado. Si deseas compartirlo, crea el enlace compartible desde la vista del reporte para evitar exponer información del titular.
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 28px;background:#F7F9F8;border-top:1px solid #D4DDDC;">
                <div style="font-size:13px;line-height:20px;color:#53646B;margin-bottom:12px;">
                  ${support}
                </div>
                <div style="font-size:11px;line-height:17px;color:#6B777C;">
                  ${safeLegalNotice}
                </div>
              </td>
            </tr>
          </table>

          <div style="max-width:640px;padding:16px 8px 0;font-size:11px;line-height:17px;color:#718086;text-align:center;">
            ${safeProductName} · La información del auto, clara antes de comprar.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildText(row: ReportRow, reportUrl: string, pdfUrl: string) {
  const report = row.report_json;
  const stats = documentarySummary(report);
  const vehicle =
    [report.identity.brand, report.identity.model].filter(Boolean).join(" ") ||
    "Vehículo consultado";
  const partial = row.status === "REPORT_PARTIAL";

  return [
    `${productName} — Reporte vehicular`,
    "",
    `Tu reporte de ${report.identity.plate} está disponible.`,
    `${vehicle}`,
    `Emitido: ${limaDate(row.created_at)} (hora de Lima)`,
    `Estado: ${partial ? "Reporte parcial" : "Reporte disponible"}`,
    "",
    `${stats.completed} secciones verificadas · ${stats.review} hallazgos para revisar · ${stats.unavailable} secciones parciales o no disponibles`,
    "",
    partial
      ? "Algunas fuentes o campos no estuvieron disponibles. Esto no acredita ausencia de antecedentes."
      : "",
    partial ? "" : "",
    `Ver reporte: ${reportUrl}`,
    `Descargar PDF: ${pdfUrl}`,
    "",
    legalNotice,
  ]
    .filter((line, index, all) => line !== "" || all[index - 1] !== "")
    .join("\n");
}

export async function sendReport(row: ReportRow, email: string) {
  if (!env.RESEND_API_KEY || !env.REPORT_FROM_EMAIL)
    throw new Error("EMAIL_NOT_CONFIGURED");

  const reportUrl = `${env.NEXT_PUBLIC_SITE_URL}/reporte/${row.public_code}`;
  const pdfUrl = `${env.NEXT_PUBLIC_SITE_URL}/api/reports/${row.public_code}/pdf`;
  const plate = row.report_json.identity.plate;

  const { error } = await new Resend(env.RESEND_API_KEY).emails.send(
    {
      from: env.REPORT_FROM_EMAIL,
      to: email,
      subject: `Tu reporte de ${plate} está listo · ${productName}`,
      html: buildHtml(row, reportUrl, pdfUrl),
      text: buildText(row, reportUrl, pdfUrl),
    },
    { idempotencyKey: `report-${row.id}-v${row.revision}` },
  );

  if (error) throw new Error(classifyResendError(error));
}
