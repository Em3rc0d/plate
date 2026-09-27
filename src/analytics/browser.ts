"use client";
export function browserTrack(
  event: string,
  properties: Record<string, string> = {},
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    let id = sessionStorage.getItem("vi_session");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("vi_session", id);
    }
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, id, properties }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
