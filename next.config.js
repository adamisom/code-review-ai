/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize Monaco Editor loading
  webpack: (config) => {
    config.module.rules.push({
      test: /\.ttf$/,
      type: 'asset/resource'
    });
    return config;
  },
};

module.exports = nextConfig;
