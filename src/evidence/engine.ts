import { parseOwner, normalizeOwners } from "@/src/vehicle/owners";
import { futureDefaults, upgradeReport } from "@/src/reports/upgrade";
import { ttl } from "@/src/config/product";
import type {
  CanonicalVehicleReport,
  Certificate,
  EvidenceRecord,
  PublicOwner,
  Section,
} from "@/src/vehicle/canonical";
import {
  get,
  str,
  num,
  list,
  obj,
  type Obj,
  type ProviderResult,
} from "@/src/providers/types";
export function date(value: string | undefined) {
  if (!value) return undefined;
  const m = value.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  const iso = m ? `${m[3]}-${m[2]}-${m[1]}` : value;
  return Number.isFinite(Date.parse(iso))
    ? new Date(iso).toISOString()
    : undefined;
}
function certificate(o: Obj): Certificate {
  const validFrom = date(str(o, "vigenciaInicio"));
  const validUntil = date(str(o, "vigenciaFin"));
  const providerStatus = str(o, "estado");
  const now = Date.now();
  const end = validUntil
    ? Date.parse(validUntil.slice(0, 10) + "T23:59:59-05:00")
    : NaN;
  const start = validFrom
    ? Date.parse(validFrom.slice(0, 10) + "T00:00:00-05:00")
    : NaN;
  const status =
    end < now
      ? "EXPIRED"
      : start <= now &&
          end >= now &&
          providerStatus?.toUpperCase() === "VIGENTE"
        ? "ACTIVE"
        : "UNKNOWN";
  return {
    issuer: str(o, "aseguradora", "centro"),
    number: str(o, "numeroPoliza", "numero"),
    validFrom,
    validUntil,
    providerStatus,
    status,
    result: str(o, "resultado"),
    coverage: str(o, "uso", "tipoServicio"),
  };
}
export function buildEvidence(
  plate: string,
  results: ProviderResult[],
): CanonicalVehicleReport {
  const report: CanonicalVehicleReport = {
    ...futureDefaults(),
    identity: { plate },
    registry: { currentOwners: [], historicalOwners: [], restrictions: [] },
    insurance: { history: [] },
    inspection: { history: [] },
    fines: {
      total: 0,
      pending: 0,
      items: [],
      coverage: { nacional: "error", lima: "error", callao: "error" },
    },
    findings: [],
    evidence: [],
    generatedAt: new Date().toISOString(),
  };
  function put(
    r: ProviderResult,
    path: string,
    value: unknown,
    status = r.status,
  ) {
    const section = path.split(".")[0] as Section;
    const checkedAt = date(r.sourceTimestamp) || r.checkedAt;
    const expires = new Date(
      Date.parse(checkedAt) + ttl[section] * 1000,
    ).toISOString();
    const prior = report.evidence.find(
      (x) =>
        x.fieldPath === path &&
        ["VERIFIED", "STALE", "CONFLICT"].includes(x.status),
    );
    const entry: EvidenceRecord = {
      fieldPath: path,
      value,
      provider: r.provider,
      originalSource: r.originalSource,
      checkedAt,
      status:
        status === "VERIFIED" && Date.parse(expires) < Date.now()
          ? "STALE"
          : status,
      freshnessExpiresAt: expires,
      metadata: {},
    };
    if (
      prior &&
      value !== null &&
      JSON.stringify(prior.value) !== JSON.stringify(value)
    ) {
      prior.status = "CONFLICT";
      prior.metadata.disagreement = true;
      entry.status = "CONFLICT";
    }
    report.evidence.push(entry);
    return !prior;
  }
  for (const r of results) {
    if (r.status !== "VERIFIED") {
      put(r, r.section, null);
      continue;
    }
    const d = r.data;
    const returnedPlate = str(d, "NumPlaca", "placa");
    if (
      returnedPlate &&
      returnedPlate.replace(/[^a-z0-9]/gi, "").toUpperCase() !== plate
    ) {
      put(r, r.section, null, "CONFLICT");
      continue;
    }
    if (r.section === "identity" || r.section === "registry") {
      const identity = {
        brand: str(d, "Marca", "marca"),
        model: str(d, "Modelo", "linea", "modeloNombre"),
        manufactureYear: num(d, "AnoFab", "anioFabricacion"),
        modelYear: num(d, "AnMode", "anioModelo"),
        color: str(d, "Color"),
        vin: str(d, "NoVin", "vin"),
        serial: str(d, "NumSerie"),
        engine: str(d, "NumMotor"),
        fuel: str(d, "DescTipoComb"),
        bodyType: str(d, "DescTipoCarr"),
        version: str(d, "NoVers"),
        registryStatus: str(d, "Estado"),
      };
      if (r.provider === "PlacApi") {
        identity.model = str(d, "linea");
        identity.modelYear = num(d, "modelo");
      }
      let found = false;
      for (const [k, v] of Object.entries(identity)) {
        if (v !== undefined) {
          found = true;
          if (put(r, `identity.${k}`, v))
            Object.assign(report.identity, { [k]: v });
        }
      }
      if (!found) put(r, "identity", null, "UNAVAILABLE");
      if (r.section === "registry") {
        for (const [key, keys] of Object.entries({
          registryNumber: ["NumPartida", "partida"],
          titleNumber: ["NumTitulo", "titulo"],
          ownershipSince: ["FechaPropi", "fechaPropiedad", "fechaProp"],
        })) {
          let v = str(d, ...keys);
          if (key === "ownershipSince") v = date(v);
          if (v && put(r, `registry.${key}`, v))
            Object.assign(report.registry, { [key]: v });
        }
        for (const [key, keys, isCurrent] of [
          ["currentOwners", ["LISTPROP", "propietarios"], true],
          [
            "historicalOwners",
            ["LISTPROPHIST", "historialPropietarios"],
            false,
          ],
        ] as const) {
          const raw = list(d, ...keys);
          const owners = raw
            ?.map((x) => parseOwner(x, isCurrent, date))
            .filter((x): x is PublicOwner => !!x);
          if (raw && owners) {
            const status =
              raw.length === 0
                ? "NOT_FOUND"
                : owners.length === raw.length
                  ? "VERIFIED"
                  : "UNAVAILABLE";
            if (put(r, `registry.${key}`, owners, status))
              report.registry[key] = owners;
          } else put(r, `registry.${key}`, null, "UNAVAILABLE");
        }
        report.registry.currentOwner = report.registry.currentOwners[0];
        const restrictions = list(d, "LISTGRAVLEV", "gravamenes");
        if (restrictions) {
          const records = restrictions
            .map((x) => ({
              description: str(x, "descripcion", "DescGrav", "acto", "tipo"),
              date: date(str(x, "fecha")),
              reference: str(x, "titulo", "numero"),
            }))
            .filter(
              (
                x,
              ): x is {
                description: string;
                date: string | undefined;
                reference: string | undefined;
              } => !!x.description,
            );
          const status =
            restrictions.length === 0
              ? "NOT_FOUND"
              : records.length === restrictions.length
                ? "VERIFIED"
                : "UNAVAILABLE";
          if (put(r, "registry.restrictions", records, status))
            report.registry.restrictions = records;
        } else put(r, "registry.restrictions", null, "UNAVAILABLE");
      }
    } else if (r.section === "insurance" || r.section === "inspection") {
      const rows = list(d, "certificados");
      if (
        !rows ||
        rows.some(
          (x) =>
            !str(x, "numeroPoliza", "numero") || !date(str(x, "vigenciaFin")),
        )
      ) {
        put(r, r.section, null, "UNAVAILABLE");
        continue;
      }
      const history = rows
        .map(certificate)
        .sort(
          (a, b) =>
            (Date.parse(b.validUntil || "") || 0) -
            (Date.parse(a.validUntil || "") || 0),
        );
      const current = history.find((x) => x.status === "ACTIVE");
      report[r.section] = { history, current };
      put(
        r,
        r.section,
        report[r.section],
        rows.length ? "VERIFIED" : "NOT_FOUND",
      );
      if (d.vigente === true && !current) {
        const last = report.evidence.at(-1)!;
        last.status = "CONFLICT";
        last.metadata.reason =
          "Provider claims current certificate without matching valid dates";
      }
    } else {
      const rows = list(d, "papeletas");
      if (!rows || rows.some((x) => !str(x, "numero"))) {
        put(r, "fines", null, "UNAVAILABLE");
        continue;
      }
      const coverage = obj(d.cobertura);
      report.fines = {
        total: num(d, "total") ?? rows.length,
        pending: num(d, "pendientes") ?? rows.length,
        pendingAmountPen: num(d, "montoPendiente"),
        items: rows.map((x) => ({
          number: str(x, "numero"),
          date: date(str(x, "fecha")),
          code: str(x, "codigo"),
          description: str(x, "descripcion"),
          amountPen: num(x, "monto"),
          entity: str(x, "entidad"),
          origin: str(x, "origen"),
          status: str(x, "estado"),
        })),
        coverage: Object.fromEntries(
          ["nacional", "lima", "callao"].map((k) => [
            k,
            ["ok", "sin_datos", "error"].includes(String(get(coverage, k)))
              ? String(get(coverage, k))
              : "error",
          ]),
        ),
      };
      put(
        r,
        "fines",
        report.fines,
        rows.length
          ? "VERIFIED"
          : Object.values(report.fines.coverage).every((v) => v === "sin_datos")
            ? "NOT_FOUND"
            : "UNAVAILABLE",
      );
    }
  }
  for (const section of [
    "identity",
    "registry",
    "insurance",
    "inspection",
    "fines",
  ] as Section[])
    if (!report.evidence.some((e) => e.fieldPath.startsWith(section)))
      report.evidence.push({
        fieldPath: section,
        value: null,
        provider: "Router",
        originalSource: "Sin fuente disponible",
        checkedAt: report.generatedAt,
        status: "UNAVAILABLE",
        freshnessExpiresAt: report.generatedAt,
        metadata: {},
      });
  const currentCandidates = report.evidence
    .filter(
      (e) => e.fieldPath === "registry.currentOwners" && Array.isArray(e.value),
    )
    .flatMap((e) => e.value as PublicOwner[]);
  const historyCandidates = report.evidence
    .filter(
      (e) =>
        e.fieldPath === "registry.historicalOwners" && Array.isArray(e.value),
    )
    .flatMap((e) => e.value as PublicOwner[]);
  const owners = normalizeOwners(currentCandidates, historyCandidates);
  Object.assign(report.registry, owners);
  report.registry.currentOwner = owners.currentOwners[0];
  for (const e of report.evidence)
    if (
      e.fieldPath === "registry.currentOwners" ||
      e.fieldPath === "registry.historicalOwners"
    ) {
      const rows = Array.isArray(e.value) ? (e.value as PublicOwner[]) : [];
      if (rows.some((o) => o.documentConsistency === "CONFLICT")) {
        e.status = "CONFLICT";
        e.metadata.ownerIdentityAmbiguous = true;
      }
    }
  return upgradeReport(report);
}
