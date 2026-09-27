"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main id="main" className="wrap page">
      <h1>No pudimos cargar esta página.</h1>
      <p>
        Intenta nuevamente. Si estabas pagando, revisa el estado del pedido
        antes de repetir el pago.
      </p>
      <button className="button primary" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}
