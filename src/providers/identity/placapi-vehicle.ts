import { call } from "../http";
import { env } from "@/src/config/env";
export const vehicle = (plate: string, id: string | null) =>
  call(
    {
      provider: "PlacApi",
      endpoint: "https://placapi.com/api/vehiculo-pe",
      key: env.PLACAPI_API_KEY,
      section: "identity",
      source: "Registro de propiedad vehicular vía PlacApi",
      cost: env.PLACAPI_COST_PER_CREDIT_PEN,
    },
    plate,
    id,
  );

import { providers } from "@/src/config/providers";
export const capabilities = providers().find(
  (p) => p.id === "vehicle",
)!.capabilities;
