import type { NextConfig } from "next";

const backendApiBaseUrl = process.env.BACKEND_API_BASE_URL || "http://localhost:5000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendApiBaseUrl.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
