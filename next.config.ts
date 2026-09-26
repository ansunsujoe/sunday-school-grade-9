import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "Lessons" was renamed to "Content"; keep old links working.
  async redirects() {
    return [
      { source: "/lessons", destination: "/content", permanent: true },
      { source: "/lessons/:id", destination: "/content/:id", permanent: true },
    ];
  },
};

export default nextConfig;
