import { call } from "../http";
import { env } from "@/src/config/env";
export const masitaprex = (plate: string, id: string | null) =>
  call(
    {
      provider: "Masitaprex",
      endpoint: "https://api.masitaprex.com/v3/consulta/placa",
      key: env.MASITAPREX_API_KEY,
      section: "registry",
      source: "Información registral vía Masitaprex",
      cost: env.MASITAPREX_COST_PER_QUERY_PEN,
    },
    plate,
    id,
  );

import { providers } from "@/src/config/providers";
export const capabilities = providers().find(
  (p) => p.id === "masitaprex",
)!.capabilities;
