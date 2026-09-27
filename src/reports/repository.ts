import { upgradeReport } from "./upgrade";
import "server-only";
import { db, checked } from "@/src/db/client";
import type { ReportRow } from "@/src/vehicle/canonical";
export async function publicReport(code: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(code)) return null;
  const row = checked(
    await db()
      .from("reports")
      .select("*")
      .eq("public_code", code)
      .maybeSingle(),
  ) as ReportRow | null;
  if (
    !row ||
    !["REPORT_READY", "REPORT_PARTIAL"].includes(row.status) ||
    (row.expires_at && Date.parse(row.expires_at) < Date.now())
  )
    return null;
  row.report_json = upgradeReport(row.report_json);
  return row;
}

export async function sharedReport(code: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(code)) return null;
  const row = checked(
    await db().from("reports").select("*").eq("share_code", code).maybeSingle(),
  ) as ReportRow | null;
  if (
    !row ||
    !["REPORT_READY", "REPORT_PARTIAL"].includes(row.status) ||
    (row.expires_at && Date.parse(row.expires_at) < Date.now())
  )
    return null;
  return row;
}
