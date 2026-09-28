"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReconcileMercadoPago() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function reconcile() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/payments/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setMessage(
        data.attempted === 0
          ? "No hay pagos pendientes de conciliación."
          : `Conciliados: ${data.synced}. Fallidos: ${data.failed}.`,
      );
      router.refresh();
    } catch {
      setMessage("No se pudo conciliar Mercado Pago. Revisa los logs.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex" style={{ margin: "18px 0" }}>
      <Button disabled={busy} variant="outline" onClick={reconcile}>
        {busy ? "Conciliando…" : "Conciliar Mercado Pago"}
      </Button>
      <span className="micro" role="status">
        {message}
      </span>
    </div>
  );
}
