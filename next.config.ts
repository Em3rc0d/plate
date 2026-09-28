import type { NextConfig } from "next";
const config: NextConfig = {
  outputFileTracingIncludes: {
    "/api/admin/providers/golden": ["./docs/GOLDEN-AKE473.md"],
    "/*": [
      "./node_modules/.pnpm/pdfkit@0.20.1/node_modules/pdfkit/js/standard-fonts/*.cjs",
    ],
  },
  serverExternalPackages: ["@react-pdf/renderer"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/:area(reporte|compartir|verificar|pago|admin|api)/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};
export default config;
