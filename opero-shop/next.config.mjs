/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configura il proxy per le API verso il backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
  // Variabili d'ambiente per lato server (SSR)
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000',
  },
};

export default nextConfig;
