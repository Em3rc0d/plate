import { env } from "@/src/config/env";
import type { OrderRow } from "@/src/vehicle/canonical";
export function processingAge(order: Pick<OrderRow, "processing_started_at">) {
  return order.processing_started_at
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - Date.parse(order.processing_started_at)) / 60000,
        ),
      )
    : null;
}
export function isStale(
  order: Pick<OrderRow, "status" | "processing_started_at">,
) {
  const age = processingAge(order);
  return (
    order.status === "REPORT_PROCESSING" &&
    (age === null || age >= env.REPORT_PROCESSING_STALE_MINUTES)
  );
}
