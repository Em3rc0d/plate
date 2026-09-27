import { call } from "../http";
import { env } from "@/src/config/env";
export const inspection = (plate: string, id: string | null) =>
  call(
    {
      provider: "PlacApi",
      endpoint: "https://placapi.com/api/revision-tecnica-pe",
      key: env.PLACAPI_API_KEY,
      section: "inspection",
      source: "Registro CITV del MTC vía PlacApi",
      cost: env.PLACAPI_COST_PER_CREDIT_PEN,
    },
    plate,
    id,
  );

import { providers } from "@/src/config/providers";
export const capabilities = providers().find(
  (p) => p.id === "inspection",
)!.capabilities;
