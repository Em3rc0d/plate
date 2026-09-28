import "server-only";
import {
  bookOfClaimsUrl,
  databaseConfigured,
  env,
  mercadoPagoConfigured,
} from "./env";
import { supports } from "./providers";

export interface CommercialReadiness {
  profile: "REGISTRY_LEAN" | "FULL";
  database: boolean;
  registry: boolean;
  identity: boolean;
  soat: boolean;
  citv: boolean;
  fines: boolean;
  payment: boolean;
  legalIdentity: boolean;
  bookOfClaims: boolean;
  reportProvider: boolean;
  ready: boolean;
}

export function commercialReadiness(): CommercialReadiness {
  const registry = supports("REGISTRY_CURRENT_OWNER");
  const identity = supports("IDENTITY");
  const soat = supports("SOAT");
  const citv = supports("CITV");
  const fines = supports("FINES_NATIONAL");
  const payment =
    mercadoPagoConfigured ||
    !!(
      (env.YAPE_DISPLAY_NAME && env.YAPE_PHONE) ||
      (env.PLIN_DISPLAY_NAME && env.PLIN_PHONE)
    );
  const legalIdentity = !!(env.BUSINESS_LEGAL_NAME && env.BUSINESS_RUC);
  const bookOfClaims = !!bookOfClaimsUrl;
  const reportProvider =
    env.LAUNCH_PROFILE === "REGISTRY_LEAN"
      ? registry && identity
      : registry && soat && citv && fines;
  return {
    profile: env.LAUNCH_PROFILE,
    database: databaseConfigured,
    registry,
    identity,
    soat,
    citv,
    fines,
    payment,
    legalIdentity,
    bookOfClaims,
    reportProvider,
    ready:
      databaseConfigured &&
      reportProvider &&
      payment &&
      legalIdentity &&
      bookOfClaims,
  };
}

export function offeringName() {
  return env.LAUNCH_PROFILE === "REGISTRY_LEAN"
    ? "Reporte Documental Vehicular"
    : "Reporte Vehicular Completo";
}

export function offeringScopeNote() {
  return env.LAUNCH_PROFILE === "REGISTRY_LEAN"
    ? "Lanzamiento lean: identidad, situación registral, titular, historial y restricciones según la fuente configurada. SOAT, CITV y papeletas solo se mostrarán cuando exista una fuente adicional habilitada."
    : "Cobertura completa configurada: registro, SOAT, CITV y papeletas según las fuentes habilitadas.";
}
