"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ClaimActions({ id }: { id: string }) {
  const [response, setResponse] = useState("");
  const [observations, setObservations] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      if (!confirm("¿Registrar esta respuesta como atendida?")) return;
      setBusy(true); setMessage("");
      try {
        const res = await fetch(`/api/admin/claims/${id}/respond`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ response, observations }) });
        if (!res.ok) throw new Error();
        setMessage("Respuesta registrada.");
        router.refresh();
      } catch {
        setMessage("No se pudo registrar la respuesta.");
      } finally { setBusy(false); }
    }}>
      <label className="field">Respuesta al consumidor<textarea value={response} onChange={(e) => setResponse(e.target.value)} minLength={3} maxLength={4000} required /></label>
      <label className="field">Observaciones internas (opcional)<textarea value={observations} onChange={(e) => setObservations(e.target.value)} maxLength={2000} /></label>
      <Button disabled={busy}>{busy ? "Guardando…" : "Marcar como atendido"}</Button>
      {message && <span className="micro" role="status">{message}</span>}
    </form>
  );
}
