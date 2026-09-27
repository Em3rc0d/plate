"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function OrderActions({
  id,
  status,
  stale = false,
  reportId,
}: {
  id: string;
  status: string;
  stale?: boolean;
  reportId?: string;
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const requestKey = useRef<string | null>(null);
  const router = useRouter();
  async function action(kind: string, forceRefresh = false, pdfOnly = false) {
    if (kind === "reject" && !confirm("¿Rechazar este comprobante?")) return;
    if (
      kind === "approve" &&
      !confirm("¿Verificaste el abono real, el destinatario y el monto?")
    )
      return;
    if (
      forceRefresh &&
      !confirm(
        "Esto vuelve a consultar proveedores y puede consumir saldo. ¿Continuar?",
      )
    )
      return;
    setBusy(true);
    try {
      if (!requestKey.current) requestKey.current = crypto.randomUUID();
      const url =
        kind === "redeliver"
          ? `/api/admin/reports/${reportId}/redeliver`
          : `/api/admin/orders/${id}/${kind}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          kind === "reprocess"
            ? { forceRefresh, requestId: requestKey.current }
            : { pdfOnly },
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setMessage(
            "El estado cambió o existe un proceso activo. Revisa el pedido.",
          );
          requestKey.current = null;
          router.refresh();
          return;
        }
        throw new Error();
      }
      requestKey.current = null;
      setMessage(
        data.status === "FAILED"
          ? "Requiere resolución manual; no otro pago."
          : "Operación finalizada.",
      );
      router.refresh();
    } catch {
      setMessage(
        "No se pudo confirmar. Reintentar conserva el identificador de la solicitud.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex">
      {status === "PAYMENT_REVIEW" && (
        <>
          <Button disabled={busy} onClick={() => action("approve")}>
            Aprobar pago
          </Button>
          <Button
            disabled={busy}
            variant="outline"
            onClick={() => action("reject")}
          >
            Rechazar
          </Button>
        </>
      )}
      {((!reportId && ["FAILED", "PAID"].includes(status)) ||
        stale ||
        (!!reportId && status === "FAILED")) && (
        <Button disabled={busy} onClick={() => action("reprocess")}>
          {stale ? "Recuperar / reprocesar" : "Reprocesar"}
        </Button>
      )}
      {reportId && (
        <>
          <Button disabled={busy} onClick={() => action("redeliver")}>
            Reenviar entrega
          </Button>
          <Button
            disabled={busy}
            variant="outline"
            onClick={() => action("redeliver", false, true)}
          >
            Reintentar PDF
          </Button>
          <Button
            disabled={busy || (status === "REPORT_PROCESSING" && !stale)}
            variant="outline"
            onClick={() => action("reprocess", true)}
          >
            Actualizar fuentes
          </Button>
        </>
      )}
      <span className="micro" role="status">
        {busy ? "Procesando…" : message}
      </span>
    </div>
  );
}
export function Logout() {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.refresh();
      }}
    >
      Cerrar sesión
    </Button>
  );
}
