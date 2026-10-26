import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // TypeScript 5 exposes the compiler API; avoid spawning the CLI for config parsing.
  experimental: { useTypeScriptCli: false },
  images: { qualities: [75, 90] },
  async rewrites() {
    return [
      { source: "/partnership", destination: "/documents/partnership.html" },
      { source: "/investor", destination: "/documents/investor.html" },
    ];
  },
  async headers() {
    return [
      ...["/partnership", "/investor", "/documents/:path*"].map(source => ({ source, headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
      ] })),
      { source: "/((?!spotify-player(?:/|$)).*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: [
        "default-src 'self'",
        `script-src 'self' 'unsafe-inline' https://www.youtube.com/iframe_api https://www.youtube.com/s/player/${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://image-cdn-ak.spotifycdn.com https://i.ytimg.com",
        "font-src 'self'",
        "connect-src 'self' https://i.ytimg.com",
        "frame-src 'self' https://www.youtube-nocookie.com https://open.spotify.com",
        "media-src 'self' https:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ].join("; ") },
    ] }];
  },
};
export default nextConfig;
