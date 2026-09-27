import type { PublicOwner } from "./canonical";
import { str, type Obj } from "@/src/providers/types";
const transientDocs = new WeakMap<PublicOwner, string>();
const normalizedName = (value: string) =>
  value
    .replace(/^\d+\s*[.)-]\s*/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
export function parseOwner(
  o: Obj,
  isCurrent: boolean,
  parseDate: (v: string | undefined) => string | undefined,
): PublicOwner | undefined {
  const name = str(
    o,
    "NombreCompleto",
    "NoProp",
    "Nombre",
    "propietario",
    "razonSocial",
    "nombreRazonSocial",
    "nombre_completo",
    "nombres",
  );
  if (!name) return;
  const raw = str(
    o,
    "NumDoc",
    "documento",
    "numeroDocumento",
    "dni",
    "documentos",
  );
  const type = str(o, "TipoDoc", "tipoDocumento")?.toUpperCase();
  const cleaned = raw?.replace(/^(DNI|L[.]?E[.]?)\s*/i, "").trim();
  const valid =
    cleaned &&
    (type === "DNI" || /^L[.]?E/i.test(raw || "")
      ? /^\d{8}$/.test(cleaned)
      : type === "RUC"
        ? /^\d{11}$/.test(cleaned)
        : type === "CE"
          ? /^[A-Z0-9]{9,12}$/.test(cleaned)
          : false);
  const owner: PublicOwner = {
    displayName: name.replace(/^\d+\s*[.)-]\s*/, ""),
    isCurrent,
    ownershipDate: parseDate(
      str(o, "FechaPropi", "fechaPropiedad", "fechaProp"),
    ),
    titleReference: str(o, "numTitulo", "titulo"),
    documentType: type,
    documentConsistency: raw ? (valid ? "CONSISTENT" : "INVALID") : "MISSING",
  };
  if (valid && cleaned) {
    transientDocs.set(owner, cleaned);
    owner.maskedDocument = "•".repeat(cleaned.length - 3) + cleaned.slice(-3);
  }
  return owner;
}
export function normalizeOwners(
  current: PublicOwner[],
  historical: PublicOwner[],
) {
  const all = [...current, ...historical];
  const byName = new Map<string, PublicOwner[]>();
  const docNames = new Map<string, Set<string>>();
  for (const o of all) {
    const name = normalizedName(o.displayName);
    byName.set(name, [...(byName.get(name) || []), o]);
    const doc = transientDocs.get(o);
    if (doc) {
      const names = docNames.get(doc) || new Set<string>();
      names.add(name);
      docNames.set(doc, names);
    }
  }
  let ambiguous = false;
  for (const [name, owners] of byName) {
    const documents = new Set(
      owners.map((o) => transientDocs.get(o)).filter(Boolean),
    );
    const datesByTitle = new Map<string, Set<string>>();
    for (const o of owners)
      if (o.titleReference && o.ownershipDate) {
        const dates = datesByTitle.get(o.titleReference) || new Set<string>();
        dates.add(o.ownershipDate);
        datesByTitle.set(o.titleReference, dates);
      }
    const conflict =
      documents.size > 1 ||
      [...documents].some((doc) => docNames.get(doc!)!.size > 1) ||
      [...datesByTitle.values()].some((d) => d.size > 1);
    const reorderedName = [...byName.keys()].some(
      (other) =>
        other !== name &&
        other.split(" ").sort().join(" ") === name.split(" ").sort().join(" "),
    );
    const noDocumentAmbiguity =
      documents.size === 0 &&
      new Set(
        owners.map((o) => `${o.ownershipDate || ""}|${o.titleReference || ""}`),
      ).size > 1;
    const uncertain =
      reorderedName ||
      noDocumentAmbiguity ||
      name.split(" ").length < 3 ||
      owners.some((o) => o.documentConsistency === "INVALID") ||
      conflict;
    if (uncertain) {
      ambiguous = true;
      owners.forEach((o) => {
        o.identityAmbiguous = true;
        delete o.maskedDocument;
        if (conflict) o.documentConsistency = "CONFLICT";
      });
    }
  }
  const dedup = (owners: PublicOwner[]) => {
    const seen = new Set<string>();
    return owners.filter((o) => {
      const key = JSON.stringify([
        normalizedName(o.displayName),
        transientDocs.get(o) || "",
        o.ownershipDate || "",
        o.titleReference || "",
        o.documentConsistency,
      ]);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  return {
    currentOwners: dedup(current),
    historicalOwners: dedup(historical),
    distinctOwnerCount: ambiguous || !all.length ? undefined : byName.size,
    ownerIdentityAmbiguous: ambiguous,
  };
}
