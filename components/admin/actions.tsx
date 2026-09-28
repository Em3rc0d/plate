"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function OrderActions({
  id,
  status,
  stale = false,
  reportId,
  providerExecutionEnabled = false,
}: {
  id: string;
  status: string;
  stale?: boolean;
  reportId?: string;
  providerExecutionEnabled?: boolean;
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
        "Esto actualiza SOAT, CITV y papeletas y puede consumir 3 créditos de PlacApi. La evidencia registral guardada se reutiliza y Masitaprex no se consulta de nuevo. ¿Continuar?",
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
        if (data?.error === "PROVIDER_EXECUTION_DISABLED") {
          setMessage(
            "Proveedores bloqueados por seguridad. El pago sigue aprobado; no se hará otro cobro.",
          );
          requestKey.current = null;
          return;
        }
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
        <Button
          disabled={busy || !providerExecutionEnabled}
          onClick={() => action("reprocess")}
        >
          {providerExecutionEnabled
            ? stale
              ? "Recuperar / reprocesar"
              : "Reprocesar"
            : "Reprocesar (proveedor bloqueado)"}
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
            Actualizar SOAT / CITV / papeletas
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


export function PdfRuntimeCheck() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/reports/pdf-runtime-check", {
        method: "GET",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error();
      setMessage(
        `PDF runtime OK · ${Number(data.bytes || 0).toLocaleString("es-PE")} bytes · Masitaprex no ejecutado.`,
      );
    } catch {
      setMessage(
        "PDF runtime falló. No se ejecutó Masitaprex; revisa logs antes de habilitar proveedores.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex">
      <Button disabled={busy} variant="outline" onClick={run}>
        {busy ? "Probando PDF…" : "Probar runtime PDF"}
      </Button>
      <span className="micro" role="status">
        {message}
      </span>
    </div>
  );
}
