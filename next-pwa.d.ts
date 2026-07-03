declare module "next-pwa" {
  import type { NextConfig } from "next";
  function withPWA(config: {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    scope?: string;
    sw?: string;
    runtimeCaching?: Array<Record<string, unknown>>;
    buildExcludes?: string[];
    publicExcludes?: string[];
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    customWorkerDir?: string;
    [key: string]: unknown;
  }): (nextConfig: NextConfig) => NextConfig;
  export default withPWA;
}