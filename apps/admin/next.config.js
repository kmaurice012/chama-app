/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@chama-app/database', '@chama-app/shared'],
}

module.exports = nextConfig
