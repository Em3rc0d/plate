import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env, databaseConfigured } from "@/src/config/env";
export function db() {
  if (!databaseConfigured) throw new Error("DATABASE_NOT_CONFIGURED");
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export function checked<T>(result: {
  data: T;
  error: { message: string } | null;
}): T {
  if (result.error) throw new Error("DATABASE_OPERATION_FAILED");
  return result.data;
}

export function required<T>(result: {
  data: T;
  error: { message: string } | null;
}): NonNullable<T> {
  const data = checked(result);
  if (data === null || data === undefined) throw new Error("NOT_FOUND");
  return data;
}
