import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
export const token = () => randomBytes(32).toString("base64url");
export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function matchesToken(value: string, expected: string) {
  const a = Buffer.from(hash(value));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
