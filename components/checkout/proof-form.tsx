"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function ProofForm({ id }: { id: string }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const form = new FormData(e.currentTarget);
        try {
          const response = await fetch(`/api/orders/${id}/payment-proof`, {
            method: "POST",
            body: form,
          });
          if (!response.ok)
            throw new Error(
              "No se pudo guardar. Usa una imagen JPG, PNG o WebP de hasta 5 MB.",
            );
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Error de carga.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="field">
        Comprobante de pago
        <input
          name="proof"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
        />
      </label>
      <p className="micro">JPG, PNG o WebP · Máximo 5 MB</p>
      <label className="field">
        Código de operación (opcional)
        <input name="reference" maxLength={100} />
      </label>
      <Button disabled={busy}>
        {busy ? "Enviando…" : "Enviar comprobante"}
      </Button>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </form>
  );
}
