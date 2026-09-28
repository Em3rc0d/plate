import { notFound } from "next/navigation";
import { publicReport } from "@/src/reports/repository";
import { ReportView } from "@/components/report/report-view";
import { databaseConfigured } from "@/src/config/env";
import { db, checked } from "@/src/db/client";
import { track } from "@/src/analytics";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({
  params,
}: {
  params: Promise<{ publicCode: string }>;
}) {
  if (!databaseConfigured) notFound();
  const row = await publicReport((await params).publicCode);
  if (!row) notFound();
  const order = checked(
    await db()
      .from("orders")
      .select("analytics_id")
      .eq("id", row.order_id)
      .maybeSingle(),
  );
  await track("report_viewed", order?.analytics_id || row.order_id, {
    source: "report",
    status: row.status,
  });
  return <ReportView row={row} />;
}
