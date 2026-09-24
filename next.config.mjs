/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["argon2", "bcryptjs"],
  },
};

export default nextConfig;
