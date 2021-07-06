import type { NextConfig } from "next/dist/next-server/server/config";

const nextConfig: Partial<NextConfig> = {
  reactStrictMode: true,

  //   poweredByHeader: false,

  async rewrites() {
    return [
      {
        source: "/graphql",
        destination: process.env.BUNDESTAGIO_SERVER_URL,
      },
    ];
  },
};

export default nextConfig;
