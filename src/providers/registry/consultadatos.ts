import { call } from "../http";
import { env } from "@/src/config/env";
export const consultadatos = (plate: string, id: string | null) =>
  call(
    {
      provider: "ConsultaDatos",
      endpoint: "https://api2.consultadatos.com/api/placa/leyenda/{PLATE}",
      key: env.CONSULTADATOS_TOKEN,
      section: "registry",
      source: "Información registral vía ConsultaDatos",
      cost: env.CONSULTADATOS_COST_PER_QUERY_PEN,
      bearer: true,
    },
    plate,
    id,
  );

import { providers } from "@/src/config/providers";
export const capabilities = providers().find(
  (p) => p.id === "consultadatos",
)!.capabilities;
