import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { requireAdmin } from "@/src/db/admin";
import { handle } from "@/src/utils/http";
export async function GET() {
  return handle(async () => {
    await requireAdmin();
    const content = await readFile(
      join(process.cwd(), "docs/GOLDEN-AKE473.md"),
      "utf8",
    );
    return new Response(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  });
}
