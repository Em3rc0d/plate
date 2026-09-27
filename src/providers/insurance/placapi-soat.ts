import { call } from "../http";
import { env } from "@/src/config/env";
export const insurance = (plate: string, id: string | null) =>
  call(
    {
      provider: "PlacApi",
      endpoint: "https://placapi.com/api/soat-pe",
      key: env.PLACAPI_API_KEY,
      section: "insurance",
      source: "Registro de aseguradoras vía PlacApi",
      cost: env.PLACAPI_COST_PER_CREDIT_PEN,
    },
    plate,
    id,
  );

import { providers } from "@/src/config/providers";
export const capabilities = providers().find(
  (p) => p.id === "insurance",
)!.capabilities;
