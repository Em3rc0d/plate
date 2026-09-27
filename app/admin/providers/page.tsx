import { requireAdmin } from "@/src/db/admin";
import { db, required } from "@/src/db/client";
import { providers } from "@/src/config/providers";
export default async function Page() {
  if (!(await requireAdmin().catch(() => null))) return null;
  const since = new Date().toISOString().slice(0, 10);
  const metrics = required(
    await db().from("provider_health_daily").select("*").gte("day", since),
  );
  const failures = required(
    await db()
      .from("provider_calls")
      .select("provider,error_code,created_at")
      .eq("status", "UNAVAILABLE")
      .order("created_at", { ascending: false })
      .limit(100),
  );
  return (
    <>
      <h2>Proveedores</h2>
      <p className="muted">
        Métricas de hoy (UTC). Costos estimados según configuración, incluidos
        intentos fallidos potencialmente cobrables.
      </p>
      <div className="grid3">
        {providers()
          .filter((p, i, all) => all.findIndex((x) => x.name === p.name) === i)
          .map(({ name, configured }) => {
            const row = metrics.find((m) => m.provider === name);
            const failure = failures.find((f) => f.provider === name);
            return (
              <article className="card" key={String(name)}>
                <h3>{name}</h3>
                <p>{configured ? "Configurado" : "NOT_CONFIGURED"}</p>
                <p>Consultas: {row?.calls || 0}</p>
                <p>
                  Éxito:{" "}
                  {row?.calls
                    ? Math.round(
                        ((Number(row.success_count) + Number(row.empty_count)) /
                          Number(row.calls)) *
                          100,
                      )
                    : 0}
                  %
                </p>
                <p>
                  Latencia media: {Math.round(Number(row?.avg_latency_ms || 0))}{" "}
                  ms
                </p>
                <p>
                  Estimado: S/ {Number(row?.estimated_cost_pen || 0).toFixed(4)}
                </p>
                <p>
                  Último fallo:{" "}
                  {failure
                    ? `${failure.error_code} · ${failure.created_at}`
                    : "Sin fallos registrados"}
                </p>
              </article>
            );
          })}
      </div>
    </>
  );
}
