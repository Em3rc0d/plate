"use client";
import { useEffect } from "react";
import { browserTrackOnce } from "@/src/analytics/browser";

export function PageEvent({ event }: { event: string }) {
  useEffect(() => {
    browserTrackOnce(event);
  }, [event]);
  return null;
}
