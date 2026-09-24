import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  // react-pdf ima native/binary ovisnosti - ne bundlati.
  serverExternalPackages: ["@react-pdf/renderer"],
  // Fontovi i logo za PDF čitaju se s diska u runtimeu; osiguraj da uđu u serverless bundle.
  outputFileTracingIncludes: {
    "/*": ["./public/fonts/**/*", "./public/ponuda/**/*"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking: stranica se ne smije ugraditi u tuđi iframe. SAMEORIGIN, ne DENY,
          // jer BotID na svojoj putanji postavlja isto i koristi vlastiti origin.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default withBotId(nextConfig);
