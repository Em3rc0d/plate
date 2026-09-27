import { requireAdmin } from "@/src/db/admin";
import { Probe } from "@/components/admin/probe";
export default async function Page() {
  if (!(await requireAdmin().catch(() => null))) return null;
  return (
    <>
      <h2>Sonda de proveedores</h2>
      <p className="muted">
        Diagnóstico manual. Nunca muestra nombres de propietarios, direcciones
        ni documentos completos.
      </p>
      <p>
        <a
          className="button outline"
          href="/api/admin/providers/golden"
          target="_blank"
          rel="noreferrer"
        >
          Abrir referencia manual AKE473
        </a>
      </p>
      <Probe />
    </>
  );
}
