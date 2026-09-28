// Offline PDF regression checks. Requires pdftotext (Poppler) for rendered output.
// Run: node --test tests/pdf-document.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import ts from "typescript";
import React from "react";
import * as pdf from "@react-pdf/renderer";
const require = createRequire(import.meta.url);
const cache = new Map();
function load(file) {
  const absolute = path.resolve(file);
  if (cache.has(absolute)) return cache.get(absolute);
  const exports = {};
  cache.set(absolute, exports);
  const code = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  // Same JS realm as the renderer: Yoga/style processing inspects object prototypes.
  new Function("exports", "require", code)(exports, (name) => {
    if (name === "@react-pdf/renderer") return pdf;
    if (name.startsWith("@/") || name.startsWith(".")) {
      const base = name.startsWith("@/")
        ? path.resolve(name.slice(2))
        : path.resolve(path.dirname(absolute), name);
      return load(
        [".ts", ".tsx"].map((ext) => base + ext).find((p) => fs.existsSync(p)),
      );
    }
    return require(name);
  });
  return exports;
}
const { PdfDocument } = load("src/reports/pdf-document.tsx");
const { futureDefaults } = load("src/reports/upgrade.ts");
const checkedAt = "2026-09-28T02:59:00Z";
function evidence(
  fieldPath,
  value,
  status = "VERIFIED",
  provider = "Proveedor de prueba",
) {
  return {
    fieldPath,
    value,
    status,
    provider,
    originalSource: "Fuente sintética",
    checkedAt,
    freshnessExpiresAt: "2027-01-01T00:00:00Z",
    metadata: {},
  };
}
function fixture(count = 10) {
  const history = Array.from({ length: count }, (_, i) => ({
    issuer: "Aseguradora de prueba",
    number: `000010076205000000${String(i + 1).padStart(6, "0")}`,
    validFrom: `${2026 - i}-09-25T00:00:00Z`,
    validUntil: `${2027 - i}-09-25T00:00:00Z`,
    status: i ? "EXPIRED" : "ACTIVE",
    providerStatus: "VIGENTE",
    coverage: "Particular",
    result: `Resultado ${i + 1}`,
  }));
  const report = {
    ...futureDefaults(),
    identity: {
      plate: "XYZ753",
      brand: "MARCA DEMO",
      model: "MODELO DEMO",
      modelYear: 2015,
      manufactureYear: 2014,
      version: "1.6",
      color: "GRIS",
      vin: "DEMO1234567890123",
      serial: "DEMO1234567890123",
      engine: "MOTOR123",
      fuel: "GASOLINA",
      bodyType: "SEDAN",
      registryStatus: "EN CIRCULACIÓN",
    },
    registry: {
      registryNumber: "DEMO53196369",
      titleNumber: "DEMO-TITULO",
      ownershipSince: "2022-03-14T00:00:00Z",
      currentOwners: [
        {
          displayName: "PERSONA DEMO ACTUAL",
          isCurrent: true,
          documentType: "DNI",
          maskedDocument: "****1234",
          ownershipDate: "2022-03-14T00:00:00Z",
          titleReference: "TITULO-DEMO-2022",
          documentConsistency: "CONSISTENT",
        },
      ],
      historicalOwners: [
        {
          displayName: "PERSONA DEMO HISTORICA UNO",
          isCurrent: false,
          identityAmbiguous: true,
          documentConsistency: "MISSING",
        },
        {
          displayName: "PERSONA DEMO HISTORICA DOS",
          isCurrent: false,
          identityAmbiguous: true,
          documentConsistency: "INVALID",
        },
      ],
      restrictions: [],
      ownerIdentityAmbiguous: true,
    },
    insurance: { current: history[0], history },
    inspection: { history: [] },
    fines: {
      total: 0,
      pending: 0,
      items: [],
      coverage: { nacional: "error", lima: "error", callao: "error" },
    },
    findings: [
      {
        severity: "REVIEW",
        title: "Historial de propietarios requiere revisión",
        detail:
          "Los registros devueltos requieren contrastar los documentos de origen.",
      },
    ],
    generatedAt: checkedAt,
    evidence: [],
  };
  report.evidence = [
    evidence("identity.brand", report.identity.brand),
    evidence("registry.registryNumber", report.registry.registryNumber),
    evidence("registry.currentOwners", report.registry.currentOwners),
    evidence("registry.historicalOwners", report.registry.historicalOwners),
    evidence("registry.restrictions", [], "NOT_FOUND"),
    evidence("insurance", report.insurance),
    evidence("inspection", null, "UNAVAILABLE"),
    evidence("fines", null, "UNAVAILABLE"),
  ];
  return {
    id: "demo-report-not-real",
    public_code: "demo-only",
    report_json: report,
    status: "REPORT_PARTIAL",
    created_at: checkedAt,
  };
}
async function render(row, name) {
  const dir =
    process.env.PDF_PREVIEW_DIR ||
    fs.mkdtempSync(path.join(os.tmpdir(), "plate-pdf-"));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.pdf`);
  const buffer = await pdf.renderToBuffer(
    React.createElement(PdfDocument, {
      row,
      verificationUrl: "https://example.test/verificar/demo-only",
    }),
  );
  fs.writeFileSync(file, buffer);
  const text = execFileSync("pdftotext", ["-layout", file, "-"], {
    encoding: "utf8",
  });
  if (!process.env.PDF_PREVIEW_DIR) fs.rmSync(dir, { recursive: true });
  return text;
}
test("customer dossier retains all certificates, owners and fields without technical metadata", async () => {
  const row = fixture();
  const before = JSON.stringify(row);
  const text = await render(row, "placaclara-demo");
  assert.equal(JSON.stringify(row), before);
  for (const record of row.report_json.insurance.history)
    assert.ok(text.includes(record.number), record.number);
  for (const owner of [
    ...row.report_json.registry.currentOwners,
    ...row.report_json.registry.historicalOwners,
  ])
    assert.ok(text.includes(owner.displayName));
  for (const value of Object.values(row.report_json.identity))
    assert.ok(text.includes(String(value)), String(value));
  assert.match(text, /14\/03\/2022/);
  assert.match(text, /Sin registros devueltos por la fuente consultada/);
  assert.match(text, /No disponible en esta consulta/);
  assert.match(text, /Coberturas aún no integradas/);
  assert.match(text, /TITULO-DEMO-2022/);
  assert.doesNotMatch(
    text,
    /VERIFIED|NOT_FOUND|UNAVAILABLE|identity\.brand|Verificado|2026-09-28T|Libre de gravámenes/,
  );
  assert.equal(text.split(row.id).length - 1, 1);
  const pages = text.split("\f").filter((p) => p.trim());
  pages.forEach((page, i) => {
    assert.ok(page.includes(`Página ${i + 1} / ${pages.length}`));
    assert.ok(
      page.replace(/\s/g, "").length > 250,
      `Orphan content on page ${i + 1}`,
    );
  });
});
test("long histories paginate completely, retaining leading zeros and column headings", async () => {
  const row = fixture(34);
  const text = await render(row, "placaclara-long-history");
  for (const cert of row.report_json.insurance.history)
    assert.ok(text.includes(cert.number), cert.number);
  assert.ok(text.split("Aseguradora /").length > 4);
});
test("conflicting values and partially returned records remain visible", async () => {
  const row = fixture(1);
  row.report_json.evidence[0].status = "CONFLICT";
  row.report_json.evidence.push(
    evidence("identity.brand", "MARCA ALTERNATIVA", "CONFLICT", "Otra fuente"),
  );
  row.report_json.evidence.find(
    (e) => e.fieldPath === "registry.historicalOwners",
  ).status = "UNAVAILABLE";
  row.report_json.fines = {
    total: 1,
    pending: 1,
    pendingAmountPen: 123.45,
    items: [
      {
        number: "PAPELETA-DEMO-001",
        date: "2026-09-01T00:00:00Z",
        code: "M99",
        description: "Descripción de prueba",
        amountPen: 123.45,
        entity: "Entidad demo",
        origin: "Lima",
        status: "Pendiente",
      },
    ],
    coverage: { nacional: "error", lima: "ok", callao: "sin_datos" },
  };
  const text = await render(row, "placaclara-conflict");
  for (const expected of [
    "MARCA DEMO",
    "MARCA ALTERNATIVA",
    "Datos en conflicto",
    "PERSONA DEMO HISTORICA DOS",
    "PAPELETA-DEMO-001",
    "123.45",
    "M99",
    "Entidad demo",
  ])
    assert.ok(text.includes(expected), expected);
});
test("unavailable consultations do not show default zero fine totals as results", async () => {
  const row = fixture(0);
  row.report_json.evidence = [
    "identity",
    "registry",
    "insurance",
    "inspection",
    "fines",
  ].map((key) => evidence(key, null, "UNAVAILABLE"));
  row.report_json.identity = { plate: "XYZ753" };
  row.report_json.registry = {
    currentOwners: [],
    historicalOwners: [],
    restrictions: [],
  };
  const text = await render(row, "placaclara-unavailable");
  assert.doesNotMatch(text, /Monto publicado|Libre de|Bajo riesgo|Verificado/);
  assert.match(text, /No disponible en esta consulta/);
});
