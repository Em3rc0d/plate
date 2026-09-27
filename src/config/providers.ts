import "server-only";
import { env } from "./env";
export type Capability =
  | "IDENTITY"
  | "REGISTRY_CURRENT_OWNER"
  | "REGISTRY_HISTORY"
  | "RESTRICTIONS"
  | "SOAT"
  | "CITV"
  | "FINES_NATIONAL"
  | "FINES_LIMA"
  | "FINES_CALLAO"
  | "THEFT"
  | "CAPTURE_ORDERS"
  | "CLAIMS"
  | "GNV"
  | "VALUATION";
export const capabilityLabels: Record<Capability, string> = {
  IDENTITY: "Identificación del vehículo",
  REGISTRY_CURRENT_OWNER: "Propietario registral",
  REGISTRY_HISTORY: "Historial de titulares",
  RESTRICTIONS: "Restricciones devueltas por fuente registral",
  SOAT: "SOAT",
  CITV: "Revisión técnica (CITV)",
  FINES_NATIONAL: "Papeletas pendientes: SUTRAN",
  FINES_LIMA: "Papeletas pendientes: Lima",
  FINES_CALLAO: "Papeletas pendientes: Callao",
  THEFT: "Registros de robo",
  CAPTURE_ORDERS: "Órdenes de captura",
  CLAIMS: "Siniestros reportados",
  GNV: "GNV",
  VALUATION: "Valorización",
};
export type AdapterId =
  | "masitaprex"
  | "consultadatos"
  | "vehicle"
  | "insurance"
  | "inspection"
  | "fines";
export interface ProviderDefinition {
  id: AdapterId;
  name: string;
  alias: string;
  configured: boolean;
  capabilities: Capability[];
  priority: number;
  contract: "DOCUMENTED" | "REQUIRES_LIVE_VALIDATION";
}
export function providers(): ProviderDefinition[] {
  return [
    {
      id: "masitaprex",
      name: "Masitaprex",
      alias: "registry-primary",
      configured: !!env.MASITAPREX_API_KEY,
      capabilities: [
        "IDENTITY",
        "REGISTRY_CURRENT_OWNER",
        "REGISTRY_HISTORY",
        "RESTRICTIONS",
      ],
      priority: 1,
      contract: "DOCUMENTED",
    },
    {
      id: "consultadatos",
      name: "ConsultaDatos",
      alias: "registry-fallback",
      configured: !!env.CONSULTADATOS_TOKEN,
      capabilities: ["IDENTITY", "REGISTRY_CURRENT_OWNER"],
      priority: 2,
      contract: "REQUIRES_LIVE_VALIDATION",
    },
    {
      id: "vehicle",
      name: "PlacApi",
      alias: "basic-identity",
      configured: !!env.PLACAPI_API_KEY,
      capabilities: ["IDENTITY"],
      priority: 3,
      contract: "DOCUMENTED",
    },
    {
      id: "insurance",
      name: "PlacApi",
      alias: "soat",
      configured: !!env.PLACAPI_API_KEY,
      capabilities: ["SOAT"],
      priority: 1,
      contract: "DOCUMENTED",
    },
    {
      id: "inspection",
      name: "PlacApi",
      alias: "citv",
      configured: !!env.PLACAPI_API_KEY,
      capabilities: ["CITV"],
      priority: 1,
      contract: "DOCUMENTED",
    },
    {
      id: "fines",
      name: "PlacApi",
      alias: "pending-fines",
      configured: !!env.PLACAPI_API_KEY,
      capabilities: ["FINES_NATIONAL", "FINES_LIMA", "FINES_CALLAO"],
      priority: 1,
      contract: "DOCUMENTED",
    },
  ];
}
export const enabledCapabilities = () => [
  ...new Set(
    providers()
      .filter((p) => p.configured)
      .flatMap((p) => p.capabilities),
  ),
];
export const coverageLabels = () =>
  enabledCapabilities().map((cap) => capabilityLabels[cap]);
export const supports = (cap: Capability) =>
  enabledCapabilities().includes(cap);
export const candidates = (cap: Capability) =>
  providers()
    .filter((p) => p.capabilities.includes(cap))
    .sort((a, b) => a.priority - b.priority);
