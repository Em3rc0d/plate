export type EvidenceStatus =
  | "VERIFIED"
  | "NOT_FOUND"
  | "UNAVAILABLE"
  | "NOT_CONFIGURED"
  | "STALE"
  | "CONFLICT";
export type QueryStatus =
  "CREATED" | "PROCESSING" | "COMPLETED" | "PARTIAL" | "FAILED";
export type OrderStatus =
  | "PAYMENT_PENDING"
  | "PAYMENT_REVIEW"
  | "PAID"
  | "REJECTED"
  | "REPORT_PROCESSING"
  | "REPORT_READY"
  | "REPORT_PARTIAL"
  | "FAILED";
export type Section =
  "identity" | "registry" | "insurance" | "inspection" | "fines";
export interface PublicOwner {
  displayName: string;
  isCurrent: boolean;
  ownershipDate?: string;
  documentType?: string;
  maskedDocument?: string;
  titleReference?: string;
  identityAmbiguous?: boolean;
  documentConsistency?: "CONSISTENT" | "MISSING" | "INVALID" | "CONFLICT";
}
export interface Certificate {
  issuer?: string;
  number?: string;
  validFrom?: string;
  validUntil?: string;
  providerStatus?: string;
  status: "ACTIVE" | "EXPIRED" | "UNKNOWN";
  result?: string;
  coverage?: string;
}
export interface FineRecord {
  number?: string;
  date?: string;
  code?: string;
  description?: string;
  amountPen?: number;
  entity?: string;
  origin?: string;
  status?: string;
}
export interface RestrictionRecord {
  description: string;
  date?: string;
  reference?: string;
}
export interface EvidenceRecord {
  fieldPath: string;
  value: unknown;
  provider: string;
  originalSource: string;
  checkedAt: string;
  status: EvidenceStatus;
  freshnessExpiresAt: string;
  metadata: Record<string, unknown>;
}
export interface Finding {
  severity: "INFO" | "REVIEW" | "IMPORTANT";
  title: string;
  detail: string;
}
export interface CanonicalVehicleReport {
  identity: {
    plate: string;
    brand?: string;
    model?: string;
    manufactureYear?: number;
    modelYear?: number;
    color?: string;
    vin?: string;
    serial?: string;
    engine?: string;
    fuel?: string;
    bodyType?: string;
    version?: string;
    registryStatus?: string;
  };
  registry: {
    currentOwner?: PublicOwner;
    currentOwners: PublicOwner[];
    ownershipSince?: string;
    registryNumber?: string;
    titleNumber?: string;
    historicalOwners: PublicOwner[];
    restrictions: RestrictionRecord[];
    distinctOwnerCount?: number;
    ownerIdentityAmbiguous?: boolean;
  };
  insurance: { current?: Certificate; history: Certificate[] };
  inspection: { current?: Certificate; history: Certificate[] };
  fines: {
    total: number;
    pending: number;
    pendingAmountPen?: number;
    items: FineRecord[];
    coverage: Record<string, string>;
  };
  theft: {
    status: EvidenceStatus;
    records: TheftRecord[];
    coverage?: CoverageInfo;
  };
  captureOrders: {
    status: EvidenceStatus;
    records: CaptureOrderRecord[];
    coverage?: CoverageInfo;
  };
  claims: {
    status: EvidenceStatus;
    records: ClaimRecord[];
    coverage?: CoverageInfo;
  };
  gnv: {
    status: EvidenceStatus;
    records: GnvRecord[];
    coverage?: CoverageInfo;
  };
  valuation: {
    status: EvidenceStatus;
    currency: "PEN";
    low?: number;
    midpoint?: number;
    high?: number;
    methodology?: string;
    comparablesCount?: number;
    checkedAt?: string;
  };
  findings: Finding[];
  evidence: EvidenceRecord[];
  generatedAt: string;
}
export interface ReportRow {
  id: string;
  order_id: string;
  public_code: string;
  report_json: CanonicalVehicleReport;
  status: OrderStatus;
  created_at: string;
  expires_at: string | null;
  pdf_path: string | null;
  summary_json: unknown;
  total_data_cost_pen: number;
  email_status: "PENDING" | "SENT" | "FAILED" | "NOT_CONFIGURED";
  share_code: string | null;
  revision: number;
  pdf_status: "PENDING" | "READY" | "FAILED" | "EXPIRED";
  pdf_deleted_at: string | null;
  delivery_token: string | null;
  delivery_started_at: string | null;
  delivery_attempted_at: string | null;
}
export interface OrderRow {
  id: string;
  plate: string;
  email: string;
  phone: string;
  amount_pen: number;
  payment_method: string;
  payment_reference: string | null;
  payment_proof_path: string | null;
  status: OrderStatus;
  created_at: string;
  paid_at: string | null;
  approved_by: string | null;
  access_token_hash: string;
  failure_code: string | null;
  processing_started_at: string | null;
  generation_token: string | null;
  generation_attempts: number;
  proof_uploaded_at: string | null;
  proof_deleted_at: string | null;
  terms_version: string | null;
  privacy_version: string | null;
  accepted_at: string | null;
}

export interface CoverageInfo {
  description: string;
  source?: string;
  checkedAt?: string;
}
export interface TheftRecord {
  reference?: string;
  status?: string;
  date?: string;
  source?: string;
}
export interface CaptureOrderRecord {
  reference?: string;
  status?: string;
  date?: string;
  source?: string;
}
export interface ClaimRecord {
  reference?: string;
  date?: string;
  type?: string;
  source?: string;
}
export interface GnvRecord {
  reference?: string;
  status?: string;
  validUntil?: string;
  source?: string;
}
