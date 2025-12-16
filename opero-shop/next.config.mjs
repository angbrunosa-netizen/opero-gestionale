/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configura il proxy per le API verso il backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
