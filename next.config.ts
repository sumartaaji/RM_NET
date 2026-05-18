
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // The images configuration is removed as next/image is no longer used for product images.
  // If you use next/image for other purposes with external URLs, you might need to re-add specific remotePatterns.
  experimental: {
    allowedDevOrigins: [
      'https://6000-firebase-studio-1749365307378.cluster-ancjwrkgr5dvux4qug5rbzyc2y.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
