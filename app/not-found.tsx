import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="wrap page">
      <p className="eyebrow">404</p>
      <h1>No encontramos este enlace.</h1>
      <p className="muted">
        Puede ser incorrecto, haber vencido o no estar disponible para tu
        sesión.
      </p>
      <Link className="button primary" href="/">
        Volver al inicio
      </Link>
    </main>
  );
}
