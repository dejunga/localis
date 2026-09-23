import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  // react-pdf ima native/binary ovisnosti - ne bundlati.
  serverExternalPackages: ["@react-pdf/renderer"],
  // Fontovi i logo za PDF čitaju se s diska u runtimeu; osiguraj da uđu u serverless bundle.
  outputFileTracingIncludes: {
    "/*": ["./public/fonts/**/*", "./public/ponuda/**/*"],
  },
};

export default withBotId(nextConfig);
