"use client";

const SESSION_KEY = "pc_session";

export function browserAnalyticsId() {
  if (typeof window === "undefined") return "";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function browserTrack(
  event: string,
  properties: Record<string, string> = {},
) {
  try {
    const id = browserAnalyticsId();
    if (!id) return;
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, id, properties }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function browserTrackOnce(
  event: string,
  scope = "session",
  properties: Record<string, string> = {},
) {
  try {
    const key = `pc_event:${event}:${scope}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    browserTrack(event, properties);
  } catch {
    browserTrack(event, properties);
  }
}
