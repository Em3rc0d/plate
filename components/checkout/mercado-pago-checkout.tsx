"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type PaymentStatus =
  | "CREATING"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "REFUNDED"
  | "CHARGED_BACK"
  | "UNKNOWN";

type CardFormData = {
  token?: string;
  paymentMethodId?: string;
  issuerId?: string;
};

type CardForm = {
  getCardFormData(): CardFormData;
  unmount?(): void;
};

type MercadoPagoClient = {
  yape(options: {
    otp: string;
    phoneNumber: string;
  }): { create(): Promise<{ id: string }> };
  cardForm(options: Record<string, unknown>): CardForm;
};

declare global {
  interface Window {
    MercadoPago?: new (
      publicKey: string,
      options?: { locale?: string },
    ) => MercadoPagoClient;
  }
}

let sdkPromise: Promise<void> | null = null;
function loadSdk() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.MercadoPago) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("mercado-pago-sdk");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("SDK_ERROR")), {
        once: true,
      });
      return;
    }
    const script = document.createElement("script");
    script.id = "mercado-pago-sdk";
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("SDK_ERROR"));
    document.head.appendChild(script);
  });
  return sdkPromise;
}

export function MercadoPagoCheckout({
  orderId,
  publicKey,
  amount,
  method,
  payerEmail,
  testMode,
}: {
  orderId: string;
  publicKey: string;
  amount: number;
  method: "MP_YAPE" | "MP_CARD";
  payerEmail: string;
  testMode: boolean;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState(testMode ? "111111111" : "");
  const [otp, setOtp] = useState(testMode ? "123456" : "");
  const idempotencyKey = useRef(crypto.randomUUID());
  const cardForm = useRef<CardForm | null>(null);

  async function submitInstrument(instrument: {
    token: string;
    paymentMethodId: string;
    installments: number;
    issuerId?: string;
  }) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/orders/${orderId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          instrument,
        }),
      });
      const data = (await response.json()) as {
        payment?: {
          status: PaymentStatus;
          testMode: boolean;
          providerStatus: string | null;
        };
        error?: string;
      };
      if (!response.ok && response.status !== 202)
        throw new Error(
          data.error === "PAYMENT_RESULT_UNKNOWN"
            ? "El resultado del pago es incierto. No vuelvas a pagar; actualiza esta página para reconciliar el intento."
            : "No se pudo procesar el pago. Intenta nuevamente en unos minutos.",
        );

      const payment = data.payment;
      if (!payment) throw new Error("No se recibió el estado del pago.");

      if (payment.status === "APPROVED") {
        setMessage(
          payment.testMode
            ? "Pago TEST aprobado. No se ejecutó ninguna consulta pagada a Masitaprex."
            : "Pago aprobado. Estamos generando tu reporte.",
        );
        if (!payment.testMode) router.refresh();
        return;
      }
      if (["REJECTED", "CANCELLED"].includes(payment.status)) {
        idempotencyKey.current = crypto.randomUUID();
        setError(
          "Mercado Pago rechazó este intento. Puedes corregir los datos y volver a intentar.",
        );
        return;
      }
      setMessage(
        "El pago quedó pendiente de confirmación. No realices un segundo pago; esta página se actualizará.",
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo procesar el pago.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    let localCardForm: CardForm | null = null;
    loadSdk()
      .then(() => {
        if (!mounted || !window.MercadoPago) return;
        setReady(true);
        if (method !== "MP_CARD") return;
        const mp = new window.MercadoPago(publicKey, { locale: "es-PE" });
        const config: Record<string, unknown> = {
          amount: amount.toFixed(2),
          iframe: true,
          form: {
            id: "mp-card-form",
            cardNumber: {
              id: "mp-card-number",
              placeholder: "Número de tarjeta",
            },
            expirationDate: {
              id: "mp-expiration-date",
              placeholder: "MM/AA",
            },
            securityCode: {
              id: "mp-security-code",
              placeholder: "CVV",
            },
            cardholderName: {
              id: "mp-cardholder-name",
              placeholder: "Nombre del titular",
            },
            issuer: { id: "mp-issuer", placeholder: "Banco emisor" },
            identificationType: { id: "mp-identification-type" },
            identificationNumber: {
              id: "mp-identification-number",
              placeholder: "Documento",
            },
            cardholderEmail: { id: "mp-cardholder-email" },
          },
          callbacks: {
            onFormMounted: (mountError: unknown) => {
              if (mountError && mounted)
                setError("No se pudo cargar el formulario seguro de tarjeta.");
            },
            onSubmit: async (event: Event) => {
              event.preventDefault();
              if (!localCardForm) return;
              const data = localCardForm.getCardFormData();
              if (!data.token || !data.paymentMethodId) {
                setError("Completa y verifica los datos de la tarjeta.");
                return;
              }
              await submitInstrument({
                token: data.token,
                paymentMethodId: data.paymentMethodId,
                installments: 1,
                ...(data.issuerId ? { issuerId: String(data.issuerId) } : {}),
              });
            },
          },
        };
        localCardForm = mp.cardForm(config);
        cardForm.current = localCardForm;
      })
      .catch(() => {
        if (mounted) setError("No se pudo cargar Mercado Pago.");
      });
    return () => {
      mounted = false;
      localCardForm?.unmount?.();
      cardForm.current = null;
    };
  }, [amount, method, publicKey]);

  async function submitYape(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.MercadoPago) {
      setError("Mercado Pago todavía está cargando.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const mp = new window.MercadoPago(publicKey, { locale: "es-PE" });
      const token = await mp.yape({ phoneNumber: phone, otp }).create();
      if (!token?.id) throw new Error("TOKEN_ERROR");
      await submitInstrument({
        token: token.id,
        paymentMethodId: "yape",
        installments: 1,
      });
    } catch {
      setError(
        "No se pudo generar el token de Yape. Revisa el celular y el código OTP.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (method === "MP_YAPE") {
    return (
      <form onSubmit={submitYape} aria-busy={busy}>
        <h2>Paga S/ {amount.toFixed(2)} con Yape</h2>
        <p className="micro">
          Mercado Pago procesa el pago. PlacaClara nunca recibe tu OTP como dato
          persistente.
        </p>
        {testMode && (
          <p className="notice">
            Modo TEST: celular 111111111 · OTP 123456. Un pago TEST aprobado no
            genera consultas a Masitaprex.
          </p>
        )}
        <label className="field">
          Celular Yape
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            pattern="[0-9]{9}"
            maxLength={9}
            required
          />
        </label>
        <label className="field">
          Código OTP de Yape
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
          />
        </label>
        <Button disabled={busy || !ready}>
          {busy ? "Procesando…" : `Pagar S/ ${amount.toFixed(2)}`}
        </Button>
        {message && <p className="notice">{message}</p>}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </form>
    );
  }

  return (
    <div>
      <h2>Paga S/ {amount.toFixed(2)} con tarjeta</h2>
      <p className="micro">
        Número de tarjeta, vencimiento y CVV se capturan en campos seguros de
        Mercado Pago y no pasan por nuestros servidores. El pago se procesa en
        una sola cuota.
      </p>
      <form id="mp-card-form" aria-busy={busy}>
        <label className="field">
          Número de tarjeta
          <div id="mp-card-number" className="mp-secure-field" />
        </label>
        <div className="two-col">
          <label className="field">
            Vencimiento
            <div id="mp-expiration-date" className="mp-secure-field" />
          </label>
          <label className="field">
            CVV
            <div id="mp-security-code" className="mp-secure-field" />
          </label>
        </div>
        <label className="field">
          Titular
          <input id="mp-cardholder-name" required />
        </label>
        <label className="field">
          Tipo de documento
          <select id="mp-identification-type" required />
        </label>
        <label className="field">
          Número de documento
          <input id="mp-identification-number" required />
        </label>
        <label className="field">
          Correo
          <input
            id="mp-cardholder-email"
            type="email"
            defaultValue={payerEmail}
            required
          />
        </label>
        <label className="field">
          Emisor
          <select id="mp-issuer" required />
        </label>
        <Button disabled={busy || !ready}>
          {busy ? "Procesando…" : `Pagar S/ ${amount.toFixed(2)}`}
        </Button>
      </form>
      {message && <p className="notice">{message}</p>}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}
