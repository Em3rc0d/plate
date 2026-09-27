import { requireAdmin } from "@/src/db/admin";
import { db, checked } from "@/src/db/client";
import { ClaimActions } from "@/components/admin/claim-actions";

type Claim = {
  id: string; claim_number: number; kind: "RECLAMO" | "QUEJA"; consumer_name: string;
  document_type: string; document_number: string; address: string; email: string; phone: string;
  item_description: string; amount_pen: number | string; detail: string; consumer_request: string;
  response_channel: "EMAIL" | "DOMICILIO"; status: "OPEN" | "ANSWERED";
  provider_response: string | null; provider_observations: string | null;
  created_at: string; responded_at: string | null;
};

export default async function Page() {
  if (!(await requireAdmin().catch(() => null))) return null;
  const claims = checked(await db().from("consumer_claims").select("*").order("created_at", { ascending: false }).limit(100)) as Claim[];
  return (
    <>
      <h2>Libro de Reclamaciones</h2>
      <p className="muted">Hojas registradas en el canal virtual. Los datos de consumidores son privados y solo deben utilizarse para su atención y conservación.</p>
      {claims.map((claim) => (
        <article className="card" key={claim.id} style={{ marginTop: 18 }}>
          <div className="flex spread"><h3>PC-{String(claim.claim_number).padStart(6, "0")} · {claim.kind}</h3><strong>{claim.status === "OPEN" ? "Pendiente" : "Atendido"}</strong></div>
          <p className="micro">{new Date(claim.created_at).toLocaleString("es-PE")} · Respuesta: {claim.response_channel === "EMAIL" ? "correo" : "domicilio"}</p>
          <p><strong>{claim.consumer_name}</strong> · {claim.document_type} {claim.document_number}</p>
          <p>{claim.email} · {claim.phone}</p><p className="micro">{claim.address}</p>
          <div className="spec-row"><span>Servicio</span><strong>{claim.item_description}</strong></div>
          <div className="spec-row"><span>Monto</span><strong>S/ {Number(claim.amount_pen).toFixed(2)}</strong></div>
          <h4>Detalle</h4><p>{claim.detail}</p><h4>Pedido del consumidor</h4><p>{claim.consumer_request}</p>
          {claim.status === "OPEN" ? <ClaimActions id={claim.id} /> : <>
            <h4>Respuesta registrada</h4><p>{claim.provider_response}</p>
            {claim.provider_observations && <p className="micro">Observaciones internas: {claim.provider_observations}</p>}
            <p className="micro">Atendido: {claim.responded_at || "—"}</p>
          </>}
        </article>
      ))}
      {!claims.length && <p className="empty">Aún no hay reclamos o quejas.</p>}
    </>
  );
}
