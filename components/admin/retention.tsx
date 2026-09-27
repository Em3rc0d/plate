"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
export function RetentionControl() {
  const [pdf, setPdf] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function run(execute: boolean) {
    if (
      execute &&
      !confirm(
        "¿Eliminar los archivos vencidos según los plazos configurados? No elimina pedidos ni contabilidad.",
      )
    )
      return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/maintenance/retention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ execute, includePdfs: pdf }),
      });
      const r = await response.json();
      if (!response.ok) throw new Error();
      setMessage(
        `Elegibles: ${r.proofsEligible} comprobantes, ${r.pdfsEligible} PDF. Eliminados: ${r.proofsDeleted} comprobantes, ${r.pdfsDeleted} PDF. Fallos: ${r.failed}. Límite: 100 por grupo.`,
      );
    } catch {
      setMessage("No se pudo completar la operación.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <label className="flex">
        <input
          type="checkbox"
          checked={pdf}
          onChange={(e) => setPdf(e.target.checked)}
        />
        Incluir PDF vencidos
      </label>
      <div className="flex" style={{ marginTop: 20 }}>
        <Button disabled={busy} variant="outline" onClick={() => run(false)}>
          Calcular elegibles
        </Button>
        <Button disabled={busy} variant="outline" onClick={() => run(true)}>
          Ejecutar retención
        </Button>
      </div>
      <p role="status">{message}</p>
    </div>
  );
}
