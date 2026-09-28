"use client";
import { browserAnalyticsId, browserTrack } from "@/src/analytics/browser";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type PaymentMethod = "MP_YAPE" | "MP_CARD" | "YAPE" | "PLIN";

export function OrderForm({
  plate,
  enabled,
  termsVersion,
  privacyVersion,
}: {
  plate: string;
  termsVersion: string;
  privacyVersion: string;
  enabled: Record<PaymentMethod, boolean>;
}) {
  const mercadoPago = enabled.MP_YAPE || enabled.MP_CARD;
  const initial: PaymentMethod = enabled.MP_YAPE
    ? "MP_YAPE"
    : enabled.MP_CARD
      ? "MP_CARD"
      : enabled.YAPE
        ? "YAPE"
        : "PLIN";
  const [method, setMethod] = useState<PaymentMethod>(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  const anyEnabled = Object.values(enabled).some(Boolean);

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
              analyticsId: browserAnalyticsId() || undefined,
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
          const next = value as PaymentMethod;
          setMethod(next);
          browserTrack("payment_method_selected", { method: next });
        }}
      >
        <TabsList className="tab-list" aria-label="Medio de pago">
          {mercadoPago ? (
            <>
              {enabled.MP_YAPE && (
                <TabsTrigger value="MP_YAPE">Yape</TabsTrigger>
              )}
              {enabled.MP_CARD && (
                <TabsTrigger value="MP_CARD">Tarjeta</TabsTrigger>
              )}
            </>
          ) : (
            <>
              {enabled.YAPE && <TabsTrigger value="YAPE">Yape</TabsTrigger>}
              {enabled.PLIN && <TabsTrigger value="PLIN">Plin</TabsTrigger>}
            </>
          )}
        </TabsList>

        <TabsContent value="MP_YAPE">
          <p className="micro">
            Paga con Yape mediante Mercado Pago. El siguiente paso solicitará tu
            celular y el OTP generado por Yape.
          </p>
        </TabsContent>
        <TabsContent value="MP_CARD">
          <p className="micro">
            Paga con tarjeta de crédito o débito en campos seguros de Mercado
            Pago. PlacaClara no recibe tu número de tarjeta ni CVV.
          </p>
        </TabsContent>
        <TabsContent value="YAPE">
          <p className="micro">
            En el siguiente paso verás los datos para pagar con Yape y adjuntar
            tu comprobante.
          </p>
        </TabsContent>
        <TabsContent value="PLIN">
          <p className="micro">
            En el siguiente paso verás los datos para pagar con Plin y adjuntar
            tu comprobante.
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
      <Button disabled={busy || !anyEnabled}>
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
