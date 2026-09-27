import Link from "next/link";
import { requireAdmin } from "@/src/db/admin";
import { Header, Footer } from "@/components/marketing/shell";
import { Login } from "@/components/admin/login";
import { Logout } from "@/components/admin/actions";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin().catch(() => null);
  return (
    <>
      <Header />
      <main id="main" className="wrap page">
        {user ? (
          <>
            <div className="flex spread">
              <h1>Operaciones</h1>
              <Logout />
            </div>
            <nav className="admin-nav" aria-label="Administración">
              <Link href="/admin">Resumen</Link>
              <Link href="/admin/orders">Pedidos</Link>
              <Link href="/admin/reports">Reportes</Link>
              <Link href="/admin/providers">Proveedores</Link>
              <Link href="/admin/providers/probe">Sonda</Link>
              <Link href="/admin/readiness">Preparación comercial</Link>
            </nav>
            {children}
          </>
        ) : (
          <div className="narrow">
            <p className="eyebrow">Acceso restringido</p>
            <h1>Administración</h1>
            <p className="muted">Ingresa con una cuenta autorizada.</p>
            <Login />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
