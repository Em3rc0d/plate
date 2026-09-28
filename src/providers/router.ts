import { masitaprex } from "./registry/masitaprex";
import { consultadatos } from "./registry/consultadatos";
import { vehicle } from "./identity/placapi-vehicle";
import { insurance } from "./insurance/placapi-soat";
import { inspection } from "./inspection/placapi-citv";
import { fines } from "./fines/placapi-fines";
import { str, list, type ProviderResult } from "./types";
import { candidates, type AdapterId } from "@/src/config/providers";
export const adapters: Record<
  AdapterId,
  (plate: string, id: string | null) => Promise<ProviderResult>
> = { masitaprex, consultadatos, vehicle, insurance, inspection, fines };
export async function registryProviders(plate: string, id: string) {
  const results: ProviderResult[] = [];
  for (const provider of candidates("REGISTRY_CURRENT_OWNER")) {
    const result = await adapters[provider.id](plate, id);
    results.push(result);
    if (
      result.status === "VERIFIED" &&
      list(result.data, "LISTPROP", "propietarios")?.length &&
      str(result.data, "Marca", "marca")
    )
      break;
  }
  if (
    !results.some(
      (r) => r.status === "VERIFIED" && str(r.data, "Marca", "marca"),
    )
  )
    results.push(await vehicle(plate, id));
  return results;
}
export async function routeProviders(plate: string, id: string) {
  const tasks = [
    registryProviders(plate, id),
    ...(["SOAT", "CITV", "FINES_NATIONAL"] as const).map((cap) =>
      adapters[candidates(cap)[0].id](plate, id).then((x) => [x]),
    ),
  ];
  const settled = await Promise.allSettled(tasks);
  return settled.flatMap((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : [
          {
            provider: "Router",
            endpoint: "internal",
            section: (
              ["registry", "insurance", "inspection", "fines"] as const
            )[i],
            status: "UNAVAILABLE" as const,
            data: {},
            checkedAt: new Date().toISOString(),
            originalSource: "Consulta interrumpida",
            cost: 0,
            errorCode: "ROUTER_FAILURE",
          },
        ],
  );
}


export async function refreshDynamicProviders(plate: string, id: string) {
  const tasks = (["SOAT", "CITV", "FINES_NATIONAL"] as const).map((cap) =>
    adapters[candidates(cap)[0].id](plate, id),
  );
  const settled = await Promise.allSettled(tasks);
  return settled.map((result, index) =>
    result.status === "fulfilled"
      ? result.value
      : {
          provider: "Router",
          endpoint: "internal",
          section: (["insurance", "inspection", "fines"] as const)[index],
          status: "UNAVAILABLE" as const,
          data: {},
          checkedAt: new Date().toISOString(),
          originalSource: "Consulta interrumpida",
          cost: 0,
          errorCode: "ROUTER_FAILURE",
        },
  );
}
