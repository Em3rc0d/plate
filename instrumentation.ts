export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      beforeSend(event) {
        delete event.request;
        delete event.user;
        delete event.breadcrumbs;
        delete event.extra;
        return event;
      },
    });
  }
}
