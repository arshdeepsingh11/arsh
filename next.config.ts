import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Certificate presentation copies live outside /public and are read by the
  // certificates route at runtime, so they must be traced into that function.
  outputFileTracingIncludes: { "/api/**/*": ["./private/certificates/**"] },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Microphone is allowed for this origin only: agents can take dictation after an explicit click.
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
