"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { browserTrack } from "@/src/analytics/browser";
export function ShareButton({ code }: { code: string }) {
  const [message, setMessage] = useState("Crear / copiar enlace compartible"),
    [url, setUrl] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div>
      <Button
        variant="outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const res = await fetch(`/api/reports/${code}/share`, {
              method: "POST",
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setUrl(data.url);
            try {
              await navigator.clipboard.writeText(data.url);
              setMessage("Enlace compartible copiado");
            } catch {
              setMessage("Copia el enlace de abajo");
            }
            browserTrack("report_shared");
          } catch {
            setMessage("No se pudo crear. Reintentar");
          } finally {
            setBusy(false);
          }
        }}
      >
        {message}
      </Button>
      {url && (
        <p className="micro" style={{ overflowWrap: "anywhere" }}>
          <a href={url}>{url}</a>
        </p>
      )}
    </div>
  );
}
