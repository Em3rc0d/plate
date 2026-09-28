"use client";
import { useEffect } from "react";
import { browserTrackOnce } from "@/src/analytics/browser";

export function PageEvent({
  event,
  scope = "session",
  properties = {},
}: {
  event: string;
  scope?: string;
  properties?: Record<string, string>;
}) {
  useEffect(() => {
    browserTrackOnce(event, scope, properties);
  }, [event, scope, properties]);
  return null;
}
