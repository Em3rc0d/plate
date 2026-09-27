import { env } from "@/src/config/env";
export function BusinessIdentity() {
  return (
    <div>
      {env.BUSINESS_LEGAL_NAME && <p>Operador: {env.BUSINESS_LEGAL_NAME}</p>}
      {env.BUSINESS_RUC && <p>RUC: {env.BUSINESS_RUC}</p>}
      {env.BUSINESS_ADDRESS && <p>Domicilio: {env.BUSINESS_ADDRESS}</p>}
      {env.SUPPORT_EMAIL && (
        <p>
          Soporte:{" "}
          <a href={`mailto:${env.SUPPORT_EMAIL}`}>{env.SUPPORT_EMAIL}</a>
        </p>
      )}
    </div>
  );
}
