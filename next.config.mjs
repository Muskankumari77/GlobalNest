/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: { serverComponentsExternalPackages: ['better-sqlite3'] },
};
export default nextConfig;
