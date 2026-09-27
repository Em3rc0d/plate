import { notFound } from "next/navigation";
import { publicReport } from "@/src/reports/repository";
import { ReportView } from "@/components/report/report-view";
import { databaseConfigured } from "@/src/config/env";
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
  return <ReportView row={row} />;
}
