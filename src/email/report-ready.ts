import "server-only";
import { Resend } from "resend";
import { env } from "@/src/config/env";
import { legalNotice, productName } from "@/src/config/product";
import type {
  EvidenceRecord,
  EvidenceStatus,
  ReportRow,
} from "@/src/vehicle/canonical";

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

function shortDate(value?: string) {
  if (!value) return "No informado";
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return value;
  return parsed.toLocaleDateString("es-PE", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function evidenceFor(evidence: EvidenceRecord[], key: string) {
  const exact = evidence.filter(
    (e) => e.fieldPath === key || e.fieldPath.startsWith(`${key}.`),
  );
  return exact.length
    ? exact
    : evidence.filter((e) => e.fieldPath === key.split(".")[0]);
}

function sectionState(evidence: EvidenceRecord[]): EvidenceStatus {
  for (const status of [
    "CONFLICT",
    "STALE",
    "UNAVAILABLE",
    "NOT_CONFIGURED",
    "VERIFIED",
    "NOT_FOUND",
  ] as const) {
    if (evidence.some((e) => e.status === status)) return status;
  }
  return "UNAVAILABLE";
}

function customerState(status: EvidenceStatus) {
  const labels: Record<EvidenceStatus, string> = {
    VERIFIED: "Información disponible",
    NOT_FOUND: "Sin registros devueltos",
    UNAVAILABLE: "No disponible en esta consulta",
    NOT_CONFIGURED: "Fuente no integrada",
    STALE: "Información desactualizada",
    CONFLICT: "Datos en conflicto",
  };
  return labels[status];
}

function summaryCards(row: ReportRow) {
  const r = row.report_json;
  const identity = sectionState(evidenceFor(r.evidence, "identity"));
  const registry = sectionState(evidenceFor(r.evidence, "registry"));
  const inspection = sectionState(evidenceFor(r.evidence, "inspection"));
  const fines = sectionState(evidenceFor(r.evidence, "fines"));
  const insurance = sectionState(evidenceFor(r.evidence, "insurance"));

  return [
    {
      title: "Vehículo",
      status: customerState(identity),
      detail: [
        r.identity.brand,
        r.identity.model,
        r.identity.modelYear,
        r.identity.color,
      ]
        .filter(Boolean)
        .join(" · "),
    },
    {
      title: "SOAT",
      status:
        insurance === "VERIFIED" && r.insurance.current
          ? r.insurance.current.status === "ACTIVE"
            ? "Vigente"
            : "Información disponible"
          : customerState(insurance),
      detail: r.insurance.current
        ? [
            r.insurance.current.issuer,
            r.insurance.current.validUntil
              ? `hasta ${shortDate(r.insurance.current.validUntil)}`
              : undefined,
          ]
            .filter(Boolean)
            .join(" · ")
        : r.insurance.history.length
          ? `${r.insurance.history.length} registros devueltos`
          : "Consulta incluida en el reporte",
    },
    {
      title: "Situación registral",
      status: customerState(registry),
      detail: r.registry.registryNumber
        ? `Partida ${r.registry.registryNumber}`
        : "Datos registrales de la consulta",
    },
    {
      title: "Cobertura pendiente",
      status:
        inspection === "VERIFIED" && fines === "VERIFIED"
          ? "Información disponible"
          : "Revisar cobertura",
      detail: `CITV: ${customerState(inspection)} · Papeletas: ${customerState(fines)}`,
    },
  ];
}

function buildHtml(row: ReportRow, reportUrl: string, pdfUrl: string) {
  const report = row.report_json;
  const partial = row.status === "REPORT_PARTIAL";
  const plate = escapeHtml(report.identity.plate);
  const vehicle = escapeHtml(
    [report.identity.brand, report.identity.model].filter(Boolean).join(" ") ||
      "Vehículo consultado",
  );
  const year = report.identity.modelYear || report.identity.manufactureYear;
  const issued = escapeHtml(limaDate(row.created_at));
  const safeReportUrl = escapeHtml(reportUrl);
  const safePdfUrl = escapeHtml(pdfUrl);
  const safeProductName = escapeHtml(productName);
  const safeLegalNotice = escapeHtml(legalNotice);
  const cards = summaryCards(row);
  const support = env.SUPPORT_EMAIL
    ? `¿Necesitas ayuda? Responde este correo o escríbenos a <a href="mailto:${escapeHtml(env.SUPPORT_EMAIL)}" style="color:#236A65;text-decoration:none;font-weight:700;">${escapeHtml(env.SUPPORT_EMAIL)}</a>.`
    : "Conserva este correo para volver a acceder a tu reporte.";

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#F6F3EC;font-family:Arial,Helvetica,sans-serif;color:#102537;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      Tu reporte vehicular de ${plate} está listo para revisar.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#F6F3EC;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:32px 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:660px;background:#FFFFFF;border:1px solid #DADFDF;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;background:#102537;color:#FFFFFF;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="font-size:22px;line-height:28px;font-weight:800;">
                      ${safeProductName}
                    </td>
                    <td align="right" style="font-size:11px;line-height:18px;color:#D4DDDF;letter-spacing:.08em;">
                      REPORTE VEHICULAR · PERÚ
                    </td>
                  </tr>
                </table>

                <div style="margin-top:30px;font-size:12px;line-height:18px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8FD0C8;">
                  Tu consulta está lista
                </div>
                <div style="margin-top:9px;font-size:31px;line-height:38px;font-weight:800;">
                  Tu reporte de ${plate} ya está disponible
                </div>
                <div style="margin-top:12px;font-size:15px;line-height:24px;color:#D8E0E4;">
                  Revisa la información disponible del vehículo, sus fuentes y las limitaciones de cobertura antes de tomar una decisión.
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:26px 28px 18px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F7F8F6;border:1px solid #DADFDF;border-radius:10px;">
                  <tr>
                    <td style="padding:20px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td valign="top">
                            <div style="display:inline-block;padding:8px 14px;border:2px solid #102537;border-radius:6px;background:#FFFFFF;font-family:'Courier New',monospace;font-size:24px;line-height:28px;font-weight:800;letter-spacing:.09em;color:#102537;">
                              ${plate}
                            </div>
                            <div style="margin-top:12px;font-size:19px;line-height:26px;font-weight:800;color:#102537;">
                              ${vehicle}${year ? ` · ${escapeHtml(year)}` : ""}
                            </div>
                            ${report.identity.color ? `<div style="margin-top:3px;font-size:13px;line-height:20px;color:#596873;">${escapeHtml(report.identity.color)}</div>` : ""}
                            <div style="margin-top:6px;font-size:12px;line-height:18px;color:#596873;">
                              Emitido ${issued} · hora de Lima
                            </div>
                          </td>
                          <td align="right" valign="top" style="padding-left:16px;">
                            <span style="display:inline-block;padding:7px 11px;border-radius:999px;background:${partial ? "#FFF3D9" : "#EAF3ED"};color:${partial ? "#825D26" : "#226348"};font-size:11px;line-height:16px;font-weight:800;">
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
              <td style="padding:4px 28px 8px;">
                <div style="font-size:12px;line-height:18px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#236A65;margin-bottom:10px;">
                  Resumen de la consulta
                </div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  ${cards
                    .map(
                      (card, index) => `
                    <tr>
                      <td style="width:50%;padding:${index < 2 ? "0 6px 10px 0" : "0 6px 0 0"};" valign="top">
                        <div style="min-height:88px;padding:14px;border:1px solid #DADFDF;border-radius:8px;background:#FFFFFF;">
                          <div style="font-size:11px;line-height:16px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#596873;">${escapeHtml(card.title)}</div>
                          <div style="margin-top:6px;font-size:15px;line-height:21px;font-weight:800;color:#102537;">${escapeHtml(card.status)}</div>
                          <div style="margin-top:5px;font-size:12px;line-height:18px;color:#596873;">${escapeHtml(card.detail)}</div>
                        </div>
                      </td>
                    </tr>`,
                    )
                    .join("")}
                </table>
              </td>
            </tr>

            ${report.registry.ownerIdentityAmbiguous ? `
            <tr>
              <td style="padding:12px 28px 0;">
                <div style="padding:13px 15px;border-left:4px solid #825D26;background:#FFF8E8;border-radius:6px;font-size:13px;line-height:20px;color:#5D481C;">
                  <strong>Historial registral para revisar.</strong> Los registros históricos devueltos no permiten afirmar por sí solos un número exacto de propietarios o transferencias.
                </div>
              </td>
            </tr>
            ` : ""}

            ${partial ? `
            <tr>
              <td style="padding:12px 28px 0;">
                <div style="padding:13px 15px;background:#F1F4F3;border-radius:6px;font-size:12px;line-height:19px;color:#596873;">
                  <strong style="color:#102537;">¿Por qué el reporte es parcial?</strong><br />
                  Alguna fuente o campo no estuvo disponible en esta consulta. PlacaClara lo muestra explícitamente para no confundir “no disponible” con “sin antecedentes”.
                </div>
              </td>
            </tr>
            ` : ""}

            <tr>
              <td style="padding:26px 28px 30px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding-right:10px;padding-bottom:10px;">
                      <a href="${safePdfUrl}" style="display:inline-block;background:#236A65;color:#FFFFFF;text-decoration:none;font-size:15px;line-height:20px;font-weight:800;padding:13px 20px;border-radius:7px;">
                        Descargar PDF
                      </a>
                    </td>
                    <td style="padding-bottom:10px;">
                      <a href="${safeReportUrl}" style="display:inline-block;background:#FFFFFF;color:#236A65;text-decoration:none;font-size:15px;line-height:20px;font-weight:800;padding:12px 19px;border:1px solid #78908D;border-radius:7px;">
                        Ver reporte web
                      </a>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:8px;font-size:12px;line-height:18px;color:#596873;">
                  El reporte contiene la información devuelta por las fuentes consultadas. La trazabilidad y las limitaciones aparecen dentro del documento sin repetir metadata técnica innecesaria.
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 28px;background:#F7F8F6;border-top:1px solid #DADFDF;">
                <div style="font-size:13px;line-height:20px;color:#596873;margin-bottom:13px;">
                  ${support}
                </div>
                <div style="font-size:11px;line-height:17px;color:#6B777C;">
                  ${safeLegalNotice}
                </div>
              </td>
            </tr>
          </table>

          <div style="max-width:660px;padding:16px 8px 0;font-size:11px;line-height:17px;color:#718086;text-align:center;">
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
  const cards = summaryCards(row);
  const vehicle =
    [report.identity.brand, report.identity.model].filter(Boolean).join(" ") ||
    "Vehículo consultado";
  const year = report.identity.modelYear || report.identity.manufactureYear;
  const partial = row.status === "REPORT_PARTIAL";

  return [
    `${productName} — Reporte vehicular`,
    "",
    `Tu reporte de ${report.identity.plate} ya está disponible.`,
    [vehicle, year].filter(Boolean).join(" · "),
    `Emitido: ${limaDate(row.created_at)} (hora de Lima)`,
    `Estado: ${partial ? "Reporte parcial" : "Reporte disponible"}`,
    "",
    "Resumen de la consulta:",
    ...cards.map((card) => `- ${card.title}: ${card.status} — ${card.detail}`),
    "",
    report.registry.ownerIdentityAmbiguous
      ? "El historial registral requiere revisión: los registros históricos devueltos no permiten afirmar por sí solos un número exacto de propietarios o transferencias."
      : "",
    partial
      ? "Alguna fuente o campo no estuvo disponible en esta consulta. Esto no acredita ausencia de antecedentes."
      : "",
    "",
    `Descargar PDF: ${pdfUrl}`,
    `Ver reporte web: ${reportUrl}`,
    "",
    legalNotice,
  ]
    .filter((line, index, all) => line !== "" || all[index - 1] !== "")
    .join("\n");
}

export async function sendReport(
  row: ReportRow,
  email: string,
  idempotencyKey = `report-${row.id}-v${row.revision}`,
) {
  if (!env.RESEND_API_KEY || !env.REPORT_FROM_EMAIL)
    throw new Error("EMAIL_NOT_CONFIGURED");

  const reportUrl = `${env.NEXT_PUBLIC_SITE_URL}/reporte/${row.public_code}`;
  const pdfUrl = `${env.NEXT_PUBLIC_SITE_URL}/api/reports/${row.public_code}/pdf`;
  const plate = row.report_json.identity.plate;

  const { error } = await new Resend(env.RESEND_API_KEY).emails.send(
    {
      from: env.REPORT_FROM_EMAIL,
      to: email,
      ...(env.SUPPORT_EMAIL ? { replyTo: env.SUPPORT_EMAIL } : {}),
      subject: `Tu reporte vehicular de ${plate} está listo · ${productName}`,
      html: buildHtml(row, reportUrl, pdfUrl),
      text: buildText(row, reportUrl, pdfUrl),
    },
    { idempotencyKey },
  );

  if (error) throw new Error(classifyResendError(error));
}
