"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { labels } from "@/src/config/product";
interface PreviewData {
  plate: string;
  brand?: string;
  model?: string;
  status: string;
  price: number;
  availableSources: Record<string, boolean>;
}
export function Preview({ initial }: { initial: string }) {
  const [plate, setPlate] = useState(initial),
    [result, setResult] = useState<PreviewData | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function run(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error === "RATE_LIMIT"
            ? "Alcanzaste el límite de consultas. Intenta en la siguiente hora."
            : "No pudimos consultar la placa. Verifica el formato e intenta nuevamente.",
        );
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo consultar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form onSubmit={run}>
        <label className="field">
          Placa
          <input
            value={plate}
            maxLength={12}
            onChange={(e) => setPlate(e.target.value)}
            placeholder="ABC-123"
            required
          />
        </label>
        <Button disabled={busy}>
          {busy ? "Consultando…" : "Revisar disponibilidad"}
        </Button>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {result && (
        <article className="card" style={{ marginTop: 24 }}>
          <div className="plate">{result.plate}</div>
          <h2>
            {[result.brand, result.model].filter(Boolean).join(" ") ||
              "Placa normalizada"}
          </h2>
          <p className="muted">{labels[result.status] || result.status}</p>
          <p>
            Las fuentes de este reporte{" "}
            {Object.values(result.availableSources).some(Boolean)
              ? "están disponibles para consulta, sujetas a su respuesta."
              : "aún no están habilitadas para consulta."}
          </p>
          {Object.values(result.availableSources).some(Boolean) ? (
            <Button asChild>
              <Link href={`/checkout?plate=${result.plate}`}>
                Obtener reporte — S/{result.price.toFixed(2)}
              </Link>
            </Button>
          ) : (
            <p className="notice">
              La compra todavía no está disponible. No se ha realizado ningún
              cobro.
            </p>
          )}
        </article>
      )}
    </>
  );
}
