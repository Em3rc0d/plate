"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
interface ProbeRow {
  id: string;
  provider: string;
  alias: string;
  configured: boolean;
  status: string;
  httpStatus: number | null;
  latencyMs: number;
  costPen: number;
  attempts: number;
  parsedCapabilities: string[];
  summary: Record<string, unknown>;
  normalizedStatuses: { field: string; status: string }[];
  errorCode: string | null;
  timestamp: string;
}
const display = (v: unknown) =>
  v === undefined ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v);
export function Probe() {
  const [plate, setPlate] = useState(""),
    [rows, setRows] = useState<ProbeRow[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          setRows([]);
          try {
            const response = await fetch("/api/admin/providers/probe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ plate }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error();
            setRows(data.rows);
          } catch {
            setError(
              "No se pudo completar la sonda. Revisa configuración, formato o límite de consultas.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="field">
          Placa
          <input
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            placeholder="AKE473"
            maxLength={12}
            required
          />
        </label>
        <p className="notice">
          Consulta real a cada adaptador configurado, incluidos fallbacks. Puede
          consumir saldo. No genera pedidos ni envía correos.
        </p>
        <Button disabled={busy}>
          {busy ? "Consultando proveedores…" : "Ejecutar sonda real"}
        </Button>
      </form>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {rows.length > 0 && (
        <>
          <h3>Comparación normalizada</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Campo</th>
                  {rows.map((r) => (
                    <th key={r.id}>
                      {r.provider} · {r.alias}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  "brand",
                  "model",
                  "manufactureYear",
                  "modelYear",
                  "owner",
                  "insurance",
                  "inspection",
                ].map((field) => {
                  const values = rows
                    .map((r) => r.summary[field])
                    .filter(
                      (v) =>
                        v !== undefined &&
                        v !== "unsupported" &&
                        typeof v !== "object",
                    );
                  const conflict = new Set(values.map(String)).size > 1;
                  return (
                    <tr key={field}>
                      <td>
                        {field}
                        {conflict ? " · REVISAR DIFERENCIA" : ""}
                      </td>
                      {rows.map((r) => (
                        <td key={r.id}>{display(r.summary[field])}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.map((r) => (
            <article className="card" key={r.id} style={{ marginTop: 20 }}>
              <h3>
                {r.provider} · {r.alias}
              </h3>
              <p>
                {r.configured ? "Configurado" : "NOT_CONFIGURED"} · {r.status}
              </p>
              <p>
                HTTP: {r.httpStatus ?? "Sin llamada HTTP"} · {r.latencyMs} ms ·
                Intentos: {r.attempts} · S/ {r.costPen.toFixed(4)}
              </p>
              <p>
                Capacidades interpretadas:{" "}
                {r.parsedCapabilities.join(", ") || "Ninguna"}
              </p>
              <p>
                Error: {r.errorCode || "—"} · {r.timestamp}
              </p>
              <details>
                <summary>Estados normalizados, sin datos personales</summary>
                {r.normalizedStatuses.map((s, i) => (
                  <p key={i}>
                    {s.field}: {s.status}
                  </p>
                ))}
              </details>
            </article>
          ))}
        </>
      )}
    </>
  );
}
