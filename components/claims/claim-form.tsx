"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Receipt = {
  code: string;
  createdAt: string;
  kind: "RECLAMO" | "QUEJA";
  consumerName: string;
  documentType: string;
  documentNumber: string;
  address: string;
  email: string;
  phone: string;
  itemDescription: string;
  amountPen: number;
  detail: string;
  request: string;
  responseChannel: "EMAIL" | "DOMICILIO";
};

export function ClaimForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  if (receipt) {
    return (
      <section className="claim-receipt" aria-live="polite">
        <p className="eyebrow">Hoja de Reclamación registrada</p>
        <h2>{receipt.code}</h2>
        <p>
          Conserva este código para el seguimiento. Puedes imprimir esta página
          como copia de tu Hoja de Reclamación.
        </p>
        <dl>
          <dt>Fecha</dt><dd>{new Date(receipt.createdAt).toLocaleString("es-PE")}</dd>
          <dt>Tipo</dt><dd>{receipt.kind === "RECLAMO" ? "Reclamo" : "Queja"}</dd>
          <dt>Consumidor</dt><dd>{receipt.consumerName}</dd>
          <dt>Documento</dt><dd>{receipt.documentType} {receipt.documentNumber}</dd>
          <dt>Domicilio</dt><dd>{receipt.address}</dd>
          <dt>Correo</dt><dd>{receipt.email}</dd>
          <dt>Teléfono</dt><dd>{receipt.phone}</dd>
          <dt>Servicio</dt><dd>{receipt.itemDescription}</dd>
          <dt>Monto</dt><dd>S/ {receipt.amountPen.toFixed(2)}</dd>
          <dt>Detalle</dt><dd>{receipt.detail}</dd>
          <dt>Pedido</dt><dd>{receipt.request}</dd>
          <dt>Respuesta preferida</dt><dd>{receipt.responseChannel === "EMAIL" ? "Correo electrónico" : "Domicilio"}</dd>
        </dl>
        <p className="notice">
          PlacaClara atenderá la queja o reclamo conforme al plazo legal
          aplicable. Registrar una Hoja de Reclamación no limita otros mecanismos
          de protección al consumidor.
        </p>
        <Button className="claim-no-print" onClick={() => window.print()}>
          Imprimir / guardar copia
        </Button>
      </section>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const form = new FormData(e.currentTarget);
        const payload = {
          kind: form.get("kind"),
          consumerName: form.get("consumerName"),
          documentType: form.get("documentType"),
          documentNumber: form.get("documentNumber"),
          address: form.get("address"),
          email: form.get("email"),
          phone: form.get("phone"),
          isMinor: form.get("isMinor") === "on",
          representativeName: form.get("representativeName"),
          representativeDocument: form.get("representativeDocument"),
          itemType: "SERVICIO",
          itemDescription: form.get("itemDescription"),
          amountPen: Number(form.get("amountPen")),
          detail: form.get("detail"),
          request: form.get("request"),
          responseChannel: form.get("responseChannel"),
          accepted: form.get("accepted") === "on",
        };
        try {
          const res = await fetch("/api/claims", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "No se pudo registrar.");
          setReceipt({ ...data, ...payload, amountPen: payload.amountPen } as Receipt);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
          setError(err instanceof Error ? err.message : "No se pudo registrar.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>1. Identificación del consumidor</h2>
      <div className="claim-grid">
        <label className="field">Nombres y apellidos<input name="consumerName" maxLength={160} required /></label>
        <label className="field">Tipo de documento<select name="documentType" required defaultValue="DNI"><option value="DNI">DNI</option><option value="CE">Carné de extranjería</option><option value="PASAPORTE">Pasaporte</option><option value="RUC">RUC</option></select></label>
        <label className="field">Número de documento<input name="documentNumber" maxLength={20} required /></label>
        <label className="field">Teléfono<input name="phone" type="tel" maxLength={20} required /></label>
        <label className="field">Correo electrónico<input name="email" type="email" maxLength={254} required /></label>
        <label className="field">Domicilio<input name="address" maxLength={240} required /></label>
      </div>

      <label className="flex" style={{ margin: "18px 0" }}><input name="isMinor" type="checkbox" /><span>El consumidor es menor de edad</span></label>
      <div className="claim-grid">
        <label className="field">Padre/madre/representante (si corresponde)<input name="representativeName" maxLength={160} /></label>
        <label className="field">Documento del representante<input name="representativeDocument" maxLength={20} /></label>
      </div>

      <h2>2. Servicio contratado</h2>
      <label className="field">Descripción<input name="itemDescription" defaultValue="Reporte Registral Vehicular PlacaClara" maxLength={240} required /></label>
      <label className="field">Monto reclamado (S/)<input name="amountPen" type="number" min="0" step="0.01" defaultValue="15.90" required /></label>

      <h2>3. Reclamo o queja</h2>
      <label className="field">Tipo<select name="kind" required defaultValue="RECLAMO"><option value="RECLAMO">Reclamo — disconformidad con el servicio</option><option value="QUEJA">Queja — malestar respecto de la atención</option></select></label>
      <label className="field">Detalle<textarea name="detail" minLength={10} maxLength={4000} required /></label>
      <label className="field">Pedido concreto del consumidor<textarea name="request" minLength={3} maxLength={2000} required /></label>
      <label className="field">Medio preferido para recibir respuesta<select name="responseChannel" required defaultValue="EMAIL"><option value="EMAIL">Correo electrónico</option><option value="DOMICILIO">Domicilio indicado</option></select></label>

      <label className="flex" style={{ margin: "22px 0", alignItems: "flex-start" }}>
        <input name="accepted" type="checkbox" required />
        <span>Declaro que la información consignada es correcta y he revisado la{" "}<a href="/legal/privacidad" target="_blank" rel="noreferrer">Política de Privacidad</a>.</span>
      </label>
      <Button disabled={busy}>{busy ? "Registrando…" : "Registrar Hoja de Reclamación"}</Button>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  );
}
