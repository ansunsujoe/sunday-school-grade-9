import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "Lessons" was renamed to "Content"; keep old links working.
  async redirects() {
    return [
      { source: "/lessons", destination: "/content", permanent: true },
      { source: "/lessons/:id", destination: "/content/:id", permanent: true },
      // The Exodus has ended; its old links and notifications land on Activities.
      { source: "/exodus", destination: "/activities", permanent: false },
      { source: "/exodus/:path*", destination: "/activities", permanent: false },
    ];
  },
};

export default nextConfig;
