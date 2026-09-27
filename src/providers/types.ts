import type { EvidenceStatus, Section } from "@/src/vehicle/canonical";
export interface ProviderResult {
  provider: string;
  endpoint: string;
  section: Section;
  status: EvidenceStatus;
  data: Record<string, unknown>;
  checkedAt: string;
  sourceTimestamp?: string;
  originalSource: string;
  cost: number;
  errorCode?: string;
}
export type Obj = Record<string, unknown>;
export function obj(v: unknown): Obj {
  return v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as Obj)
    : {};
}
export function get(o: Obj, ...keys: string[]): unknown {
  for (const key of keys) {
    const k = Object.keys(o).find((x) => x.toLowerCase() === key.toLowerCase());
    if (k && o[k] !== null && o[k] !== undefined) return o[k];
  }
}
export function str(o: Obj, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const v = get(o, key);
    if (typeof v === "string" && v.trim() && !/^#+$/.test(v.trim()))
      return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return undefined;
}
export function num(o: Obj, ...keys: string[]): number | undefined {
  const v = get(o, ...keys);
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
export function list(o: Obj, ...keys: string[]): Obj[] | undefined {
  const v = get(o, ...keys);
  return Array.isArray(v) ? v.map(obj) : undefined;
}
