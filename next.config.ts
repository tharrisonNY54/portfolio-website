import type { NextConfig } from 'next';

// Permissions for WebXR/camera (8th Wall and ScannedReality AR on mobile)
const PERMISSIONS_POLICY =
  'camera=(self), microphone=(self), gyroscope=(self), accelerometer=(self), xr-spatial-tracking=(self)';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  async headers() {
    return [
      // 8th Wall iframe: no COEP/COOP so it can load cross-origin scripts (CloudFront, CDNs)
      {
        source: '/8thwall/:path*',
        headers: [
          { key: 'Permissions-Policy', value: PERMISSIONS_POLICY },
        ],
      },
      // Rest of app: strict isolation for SharedArrayBuffer; same permissions
      {
        source: '/:path*',
        headers: [
          { key: 'Permissions-Policy', value: PERMISSIONS_POLICY },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
