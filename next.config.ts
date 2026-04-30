import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== 'production';
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? (isDev ? '' : 'https://grss-field-analyst.onrender.com');
const socketWss = socketUrl.replace('https://', 'wss://');

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },

  async headers() {
    // In development, allow all sources so cross-device testing over LAN works
    // In production, lock down to known origins
    const connectSrc = isDev
      ? "connect-src *"
      : `connect-src 'self' ${socketUrl} ${socketWss}`;

    const cspValue = isDev
      ? [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https://upload.wikimedia.org blob:",
        connectSrc,
        "frame-ancestors 'none'",
      ].join('; ')
      : [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https://upload.wikimedia.org blob:",
        connectSrc,
        "frame-ancestors 'none'",
      ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: cspValue,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
