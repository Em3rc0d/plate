import Link from "next/link";
import { Header, Footer } from "@/components/marketing/shell";
import { BusinessIdentity } from "@/components/marketing/legal-content";
export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="wrap page">
        <h1>Información del servicio</h1>
        <BusinessIdentity />
        <ul>
          <li>
            <Link href="/legal/privacidad">Privacidad</Link>
          </li>
          <li>
            <Link href="/legal/terminos">Términos y condiciones</Link>
          </li>
          <li>
            <Link href="/legal/reembolsos">Reembolsos</Link>
          </li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
