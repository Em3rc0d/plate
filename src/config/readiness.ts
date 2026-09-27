import "server-only";
import {
  bookOfClaimsUrl,
  env,
  databaseConfigured,
  mercadoPagoConfigured,
} from "./env";
import { commercialReadiness } from "./commercial";
import { providers, supports } from "./providers";
import { db } from "@/src/db/client";
export interface ReadinessItem {
  group: string;
  label: string;
  state: "READY" | "OPTIONAL" | "BLOCKER";
  detail?: string;
}
export async function readiness(adminWorking: boolean) {
  const items: ReadinessItem[] = [];
  const add = (
    group: string,
    label: string,
    ok: boolean,
    optional = false,
    detail?: string,
  ) =>
    items.push({
      group,
      label,
      state: ok ? "READY" : optional ? "OPTIONAL" : "BLOCKER",
      detail,
    });
  let database = false,
    storage = false,
    claims = false;
  if (databaseConfigured) {
    const results = await Promise.allSettled([
      db().from("orders").select("id,generation_token,terms_version").limit(1),
      db().from("reports").select("share_code,pdf_status,revision").limit(1),
      db().from("consumer_claims").select("id,claim_number,status").limit(1),
      db().from("payment_attempts").select("id,status").limit(1),
      db().storage.getBucket("payment-proofs"),
      db().storage.getBucket("report-pdfs"),
      db().storage.from("payment-proofs").list("", { limit: 1 }),
      db().storage.from("report-pdfs").list("", { limit: 1 }),
    ]);
    database = results
      .slice(0, 2)
      .every((r) => r.status === "fulfilled" && !r.value.error);
    claims =
      results[2]?.status === "fulfilled" && !results[2].value.error;
    const payments =
      results[3]?.status === "fulfilled" && !results[3].value.error;
    database = database && payments;
    storage =
      results
        .slice(4)
        .every((r) => r.status === "fulfilled" && !r.value.error) &&
      results
        .slice(4, 6)
        .every(
          (r) =>
            r.status === "fulfilled" &&
            r.value.data &&
            "public" in r.value.data &&
            r.value.data.public === false,
        );
  }
  add("Infraestructura", "Supabase URL", !!env.NEXT_PUBLIC_SUPABASE_URL);
  add("Infraestructura", "Service role", !!env.SUPABASE_SERVICE_ROLE_KEY);
  add("Infraestructura", "Base de datos y migraciones accesibles", database);
  add(
    "Infraestructura",
    "Buckets privados y acceso de lectura",
    storage,
    false,
    "La carga y descarga reales se confirman en la compra interna.",
  );
  add("Infraestructura", "Autenticación administrativa", adminWorking);
  add(
    "Infraestructura",
    "Libro de Reclamaciones y almacenamiento",
    claims,
    false,
    claims ? "Tabla privada accesible." : "Aplica la migración del Libro de Reclamaciones.",
  );
  for (const p of providers().filter(
    (p, i, arr) => arr.findIndex((x) => x.name === p.name) === i,
  ))
    add(
      "Proveedores",
      p.name,
      p.configured,
      true,
      p.contract === "REQUIRES_LIVE_VALIDATION"
        ? "Contrato completo pendiente de corroborar con la sonda."
        : "Una clave presente no acredita respuesta válida.",
    );
  add(
    "Proveedores",
    "Al menos un proveedor registral",
    supports("REGISTRY_CURRENT_OWNER"),
  );
  const lean = env.LAUNCH_PROFILE === "REGISTRY_LEAN";
  for (const [cap, label] of [
    ["SOAT", "SOAT"],
    ["CITV", "CITV"],
    ["FINES_NATIONAL", "Papeletas"],
  ] as const)
    add(
      "Proveedores",
      label,
      supports(cap),
      lean,
      lean
        ? "Opcional en lanzamiento lean; se habilita cuando exista una fuente adicional validada."
        : undefined,
    );
  const yape = !!env.YAPE_DISPLAY_NAME && !!env.YAPE_PHONE,
    plin = !!env.PLIN_DISPLAY_NAME && !!env.PLIN_PHONE;
  add(
    "Pago",
    "Mercado Pago Checkout API",
    mercadoPagoConfigured,
    true,
    mercadoPagoConfigured
      ? env.MERCADO_PAGO_LIVE_MODE
        ? "Credenciales LIVE configuradas. Requiere E2E real antes de abrir tráfico."
        : "Configurado en TEST. Los pagos aprobados no disparan Masitaprex."
      : "Configura Public Key, Access Token, Collector ID y Webhook Secret.",
  );
  add(
    "Pago",
    "Yape vía Mercado Pago",
    mercadoPagoConfigured,
    true,
    "Tokenización con MercadoPago.js; payment_method_id=yape.",
  );
  add(
    "Pago",
    "Tarjeta vía Mercado Pago",
    mercadoPagoConfigured,
    true,
    "CardForm seguro; PAN/CVV no pasan por PlacaClara.",
  );
  add("Pago", "Fallback manual Yape", yape, true);
  add("Pago", "Fallback manual Plin", plin, true);
  add("Pago", "QR Yape", !!env.NEXT_PUBLIC_YAPE_QR_URL, true);
  add("Pago", "QR Plin", !!env.NEXT_PUBLIC_PLIN_QR_URL, true);
  add("Entrega", "Resend", !!env.RESEND_API_KEY, true);
  add("Entrega", "Remitente", !!env.REPORT_FROM_EMAIL, true);
  add("Observabilidad", "PostHog", !!env.NEXT_PUBLIC_POSTHOG_KEY, true);
  add("Observabilidad", "Sentry", !!env.SENTRY_DSN, true);
  for (const [label, value] of [
    ["Razón social", env.BUSINESS_LEGAL_NAME],
    ["RUC", env.BUSINESS_RUC],
    ["Domicilio del operador", env.BUSINESS_ADDRESS],
    ["Correo de soporte", env.SUPPORT_EMAIL],
    ["Correo de privacidad", env.PRIVACY_EMAIL],
    ["Libro de Reclamaciones", bookOfClaimsUrl],
  ])
    add("Negocio y privacidad", label, !!value);
  add("Negocio y privacidad", "Página de privacidad", true);
  add("Negocio y privacidad", "Página de términos", true);
  add("Negocio y privacidad", "Página de reembolsos", true);
  const commercial = commercialReadiness();
  add(
    "Lanzamiento",
    "Checkout comercial habilitable",
    commercial.ready,
    false,
    commercial.ready
      ? env.LAUNCH_PROFILE === "REGISTRY_LEAN"
        ? "Cobertura registral lean, pago e identidad comercial configurados."
        : "Cobertura completa, pago e identidad comercial configurados."
      : env.LAUNCH_PROFILE === "REGISTRY_LEAN"
        ? "No se aceptarán pagos hasta completar cobertura registral, pago, identidad legal y Libro de Reclamaciones."
        : "No se aceptarán pagos hasta completar cobertura mínima, pago, identidad legal y Libro de Reclamaciones.",
  );
  return {
    items,
    blockers: items.filter((x) => x.state === "BLOCKER").length,
    database,
    storage,
    reportProvider: commercial.reportProvider,
    payment: commercial.payment,
    commercialReady: commercial.ready,
    email: !!env.RESEND_API_KEY && !!env.REPORT_FROM_EMAIL,
  };
}
