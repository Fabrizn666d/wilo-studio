import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  webpack(config) {
    const currentIgnored = config.watchOptions?.ignored;
    const databasePattern = /[\\/]prisma[\\/][^\\/]+\.db(?:-(?:journal|wal|shm))?$/;
    const ignored = currentIgnored instanceof RegExp
      ? new RegExp(`${currentIgnored.source}|${databasePattern.source}`, currentIgnored.flags)
      : [
          ...(Array.isArray(currentIgnored)
            ? currentIgnored.filter((item): item is string => typeof item === "string" && item.length > 0)
            : typeof currentIgnored === "string" && currentIgnored.length > 0
              ? [currentIgnored]
              : []),
          "**/prisma/*.db",
          "**/prisma/*.db-journal",
          "**/prisma/*.db-wal",
          "**/prisma/*.db-shm",
        ];

    config.watchOptions = {
      ...config.watchOptions,
      ignored,
    };
    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [90, 95],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
