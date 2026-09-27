"use client";
import { useEffect } from "react";
import { browserTrack } from "@/src/analytics/browser";
export function PageEvent({ event }: { event: string }) {
  useEffect(() => {
    browserTrack(event);
  }, [event]);
  return null;
}
