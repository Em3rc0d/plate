import { labels } from "@/src/config/product";
import { futureSections } from "./upgrade";
import type { CanonicalVehicleReport } from "@/src/vehicle/canonical";
export const fieldLabels: Record<string, string> = {
  distinctOwnerCount: "Identidades distintas devueltas",
  ownerIdentityAmbiguous: "Identidad por revisar",
  identityAmbiguous: "Identidad por revisar",
  titleReference: "Referencia de título",
  documentConsistency: "Consistencia documental",
  count: "Registros devueltos",
  latest: "Último certificado devuelto",
  current: "Certificado vigente",
  history: "Historial devuelto",
  items: "Papeletas",
  nacional: "SUTRAN",
  lima: "Lima",
  callao: "Callao",
  plate: "Placa",
  brand: "Marca",
  model: "Modelo",
  manufactureYear: "Año de fabricación",
  modelYear: "Año de modelo",
  color: "Color",
  vin: "VIN",
  serial: "Serie",
  engine: "Motor",
  fuel: "Combustible",
  bodyType: "Carrocería",
  version: "Versión",
  registryStatus: "Estado registral",
  currentOwners: "Propietarios registrados",
  historicalOwners: "Historial de propietarios",
  restrictions: "Restricciones",
  registryNumber: "Partida",
  titleNumber: "Título",
  ownershipSince: "Titularidad desde",
  displayName: "Nombre",
  isCurrent: "Actual",
  ownershipDate: "Fecha de titularidad",
  documentType: "Tipo de documento",
  maskedDocument: "Documento enmascarado",
  issuer: "Emisor / centro",
  number: "Número",
  validFrom: "Vigente desde",
  validUntil: "Vigente hasta",
  providerStatus: "Estado devuelto",
  status: "Estado",
  result: "Resultado",
  coverage: "Cobertura",
  total: "Registros devueltos",
  pending: "Pendientes",
  pendingAmountPen: "Monto publicado (S/)",
  date: "Fecha",
  code: "Código",
  description: "Descripción",
  amountPen: "Monto publicado (S/)",
  entity: "Entidad",
  origin: "Jurisdicción",
  reference: "Referencia",
};
function scalarLabel(key: string, value: unknown) {
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "string") {
    if (/^\\d{4}-\\d{2}-\\d{2}T/.test(value) && !Number.isNaN(Date.parse(value))) {
      return new Date(value).toLocaleDateString("es-PE", {
        timeZone: "UTC",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }
    if (key === "documentConsistency") {
      if (value === "CONSISTENT") return "Consistente";
      if (value === "INVALID") return "Inválida / requiere revisión";
    }
    if (key === "status") {
      if (value === "ACTIVE") return "Vigente";
      if (value === "EXPIRED") return "Vencido";
      if (value === "UNKNOWN") return "Estado no determinado";
    }
  }
  return labels[String(value)] || String(value);
}

export function lines(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value))
    return value.flatMap((v, i) => [`Registro ${i + 1}`, ...lines(v)]);
  if (typeof value === "object")
    return Object.entries(value)
      .filter(([k, v]) => v !== undefined && k !== "currentOwner")
      .flatMap(([k, v]) =>
        typeof v === "object"
          ? [fieldLabels[k] || k, ...lines(v)]
          : [`${fieldLabels[k] || k}: ${scalarLabel(k, v)}`],
      );
  return [String(value)];
}
export function reportSections(r: CanonicalVehicleReport) {
  return [
    {
      key: "identity",
      title: "Identificación del vehículo",
      value: r.identity,
    },
    {
      key: "registry",
      title: "Situación registral",
      value: {
        registryNumber: r.registry.registryNumber,
        titleNumber: r.registry.titleNumber,
        ownershipSince: r.registry.ownershipSince,
      },
    },
    {
      key: "registry.currentOwners",
      title: "Propietario registrado",
      value: r.registry.currentOwners,
    },
    {
      key: "registry.historicalOwners",
      title: "Historial de propietarios",
      value: r.registry.historicalOwners,
    },
    { key: "insurance", title: "SOAT", value: r.insurance },
    { key: "inspection", title: "Revisión técnica", value: r.inspection },
    { key: "fines", title: "Papeletas pendientes", value: r.fines },
    {
      key: "registry.restrictions",
      title: "Restricciones / gravámenes devueltos",
      value: r.registry.restrictions,
    },
    ...Object.entries(futureSections).map(([key, title]) => ({
      key,
      title,
      value: r[key as keyof typeof futureSections],
    })),
  ];
}
