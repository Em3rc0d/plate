import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/src/config/env";
export async function authClient() {
  const jar = await cookies();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    throw new Error("AUTH_NOT_CONFIGURED");
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
              }),
            );
          } catch {}
        },
      },
    },
  );
}
export async function requireAdmin() {
  const auth = await authClient();
  const { data, error } = await auth.auth.getUser();
  if (error || !data.user || data.user.app_metadata.role !== "admin")
    throw new Error("UNAUTHORIZED");
  return data.user;
}
