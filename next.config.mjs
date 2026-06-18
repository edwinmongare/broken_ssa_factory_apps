import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  pageExtensions: ["ts", "tsx"],
  async redirects() {
    return [
      { source: "/", destination: "/sign-in", permanent: false },
    ];
  },
};

export default withPayload(nextConfig);
