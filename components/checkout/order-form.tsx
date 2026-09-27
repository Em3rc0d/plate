"use client";
import { browserTrack } from "@/src/analytics/browser";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
export function OrderForm({
  plate,
  enabled,
  termsVersion,
  privacyVersion,
}: {
  plate: string;
  termsVersion: string;
  privacyVersion: string;
  enabled: { YAPE: boolean; PLIN: boolean };
}) {
  const [method, setMethod] = useState(enabled.YAPE ? "YAPE" : "PLIN"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  return (
    <form
      aria-busy={busy}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const form = new FormData(e.currentTarget);
        try {
          const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              plate,
              termsVersion,
              privacyVersion,
              email: form.get("email"),
              phone: form.get("phone"),
              method,
              accepted: form.get("accepted") === "on",
            }),
          });
          const data = await res.json();
          if (!res.ok)
            throw new Error(
              "No se pudo iniciar el pedido. Revisa tus datos o intenta más tarde.",
            );
          router.push(`/pago/${data.id}`);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Error al crear pedido.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="field">
        Correo de contacto
        <input
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
        />
      </label>
      <label className="field">
        WhatsApp / teléfono
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          pattern="[+0-9 ()-]{7,20}"
          maxLength={20}
          required
        />
      </label>
      <p>Medio de pago</p>
      <Tabs
        value={method}
        onValueChange={(value) => {
          setMethod(value);
          browserTrack("payment_method_selected", { method: value });
        }}
      >
        <TabsList className="tab-list" aria-label="Medio de pago">
          <TabsTrigger value="YAPE" disabled={!enabled.YAPE}>
            Yape
          </TabsTrigger>
          <TabsTrigger value="PLIN" disabled={!enabled.PLIN}>
            Plin
          </TabsTrigger>
        </TabsList>
        <TabsContent value="YAPE">
          <p className="micro">
            {enabled.YAPE
              ? "En el siguiente paso verás los datos para pagar con Yape y adjuntar tu comprobante."
              : "Yape no está disponible para este pedido."}
          </p>
        </TabsContent>
        <TabsContent value="PLIN">
          <p className="micro">
            {enabled.PLIN
              ? "En el siguiente paso verás los datos para pagar con Plin y adjuntar tu comprobante."
              : "Plin no está disponible para este pedido."}
          </p>
        </TabsContent>
      </Tabs>
      <label
        className="flex checkout-consent"
        style={{ margin: "22px 0", alignItems: "flex-start", fontSize: 14 }}
      >
        <input type="checkbox" name="accepted" required />
        <span>
          He leído y acepto los{" "}
          <a href="/legal/terminos" target="_blank" rel="noreferrer">
            términos
          </a>
          ,{" "}
          <a href="/legal/privacidad" target="_blank" rel="noreferrer">
            política de privacidad
          </a>{" "}
          y condiciones del reporte.
        </span>
      </label>
      <Button disabled={busy || (!enabled.YAPE && !enabled.PLIN)}>
        {busy ? "Creando pedido…" : "Continuar al pago"}
      </Button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
