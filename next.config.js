/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/register/dues-card',
        permanent: true,
      },
      {
        source: '/account',
        destination: '/account/profile',
        permanent: true,
      },
    ];
  },
};
module.exports = nextConfig;
