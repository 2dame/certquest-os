/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@certquest/types',
    '@certquest/db',
    '@certquest/content',
    '@certquest/scheduler',
    '@certquest/gamification',
  ],
};

module.exports = nextConfig;
