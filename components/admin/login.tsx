"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function Login() {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const f = new FormData(e.currentTarget);
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: f.get("email"),
              password: f.get("password"),
            }),
          });
          if (!res.ok) throw new Error();
          router.refresh();
        } catch {
          setError("Acceso denegado o servicio no disponible.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="field">
        Correo
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label className="field">
        Contraseña
        <input
          name="password"
          type="password"
          minLength={8}
          autoComplete="current-password"
          required
        />
      </label>
      <Button disabled={busy}>{busy ? "Verificando…" : "Ingresar"}</Button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
