import "server-only";
import { z } from "zod";
const optional = z.string().default("");
const blankAsUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;
const defaultSiteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
const siteUrl = z.preprocess(
  (v) => (typeof v === "string" && v.trim() ? v.trim() : defaultSiteUrl),
  z
    .string()
    .url()
    .refine((v) => {
      const u = new URL(v);
      return (
        ["http:", "https:"].includes(u.protocol) &&
        u.pathname === "/" &&
        !u.search &&
        !u.hash
      );
    }, "Site URL must be an origin"),
);
const amount = (fallback: number) =>
  z.preprocess(
    (v) => (v === "" || v === undefined ? fallback : v),
    z.coerce.number().finite().nonnegative(),
  );
export const env = z
  .object({
    NEXT_PUBLIC_PRODUCT_NAME: z.preprocess(
      blankAsUndefined,
      z.string().default("Vehicle Intelligence PE"),
    ),
    NEXT_PUBLIC_SITE_URL: siteUrl,
    REPORT_PRICE_PEN: amount(15.9),
    LAUNCH_PROFILE: z.preprocess(
      blankAsUndefined,
      z.enum(["REGISTRY_LEAN", "FULL"]).default("REGISTRY_LEAN"),
    ),
    NEXT_PUBLIC_SUPABASE_URL: optional,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: optional,
    SUPABASE_SERVICE_ROLE_KEY: optional,
    MASITAPREX_API_KEY: optional,
    CONSULTADATOS_TOKEN: optional,
    PLACAPI_API_KEY: optional,
    MASITAPREX_COST_PER_QUERY_PEN: amount(0.036),
    CONSULTADATOS_COST_PER_QUERY_PEN: amount(0.026),
    PLACAPI_COST_PER_CREDIT_PEN: amount(0.1),
    RESEND_API_KEY: optional,
    REPORT_FROM_EMAIL: optional,
    ADMIN_EMAIL: optional,
    OPENAI_API_KEY: optional,
    OPENAI_MODEL: z.preprocess(
      blankAsUndefined,
      z.string().default("gpt-4.1-mini"),
    ),
    NEXT_PUBLIC_POSTHOG_KEY: optional,
    NEXT_PUBLIC_POSTHOG_HOST: optional,
    SENTRY_DSN: optional,
    NEXT_PUBLIC_SENTRY_DSN: optional,
    YAPE_DISPLAY_NAME: optional,
    YAPE_PHONE: optional,
    NEXT_PUBLIC_YAPE_QR_URL: optional,
    PLIN_DISPLAY_NAME: optional,
    PLIN_PHONE: optional,
    NEXT_PUBLIC_PLIN_QR_URL: optional,
    RATE_LIMIT_SALT: optional,
    REPORT_PROCESSING_STALE_MINUTES: z.preprocess(
      (v) => (v === "" || v === undefined ? 10 : v),
      z.coerce.number().int().min(6).max(1440),
    ),
    BUSINESS_LEGAL_NAME: optional,
    BUSINESS_RUC: z
      .string()
      .regex(/^$|^\d{11}$/)
      .default(""),
    BUSINESS_ADDRESS: optional,
    SUPPORT_EMAIL: z.union([z.literal(""), z.string().email()]).default(""),
    PRIVACY_EMAIL: z.union([z.literal(""), z.string().email()]).default(""),
    BOOK_OF_CLAIMS_URL: z
      .union([
        z.literal(""),
        z
          .string()
          .url()
          .refine((v) => v.startsWith("https://")),
      ])
      .default(""),
    TERMS_VERSION: z.preprocess(
      blankAsUndefined,
      z.string().min(1).default("2026-09"),
    ),
    PRIVACY_VERSION: z.preprocess(
      blankAsUndefined,
      z.string().min(1).default("2026-09"),
    ),
    REFUND_POLICY_VERSION: z.preprocess(
      blankAsUndefined,
      z.string().min(1).default("2026-09"),
    ),
    PAYMENT_PROOF_RETENTION_DAYS: z.preprocess(
      (v) => (v === "" || v === undefined ? null : v),
      z.coerce.number().int().positive().nullable(),
    ),
    REPORT_RETENTION_DAYS: z.preprocess(
      (v) => (v === "" || v === undefined ? null : v),
      z.coerce.number().int().positive().nullable(),
    ),
    PREVIEW_PROVIDER_MODE: z.preprocess(
      blankAsUndefined,
      z.enum(["NONE", "BASIC", "FULL"]).default("NONE"),
    ),
  })
  .parse(process.env);
export const databaseConfigured = !!(
  env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
);
export const providerConfigured = !!(
  env.MASITAPREX_API_KEY ||
  env.CONSULTADATOS_TOKEN ||
  env.PLACAPI_API_KEY
);
