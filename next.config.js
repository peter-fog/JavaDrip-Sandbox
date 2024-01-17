const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['csk-ui'],
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
    NEXT_PUBLIC_BUILD_TIMESTAMP: String(new Date().valueOf()),
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*' }],
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536],
  },
  async redirects() {
    const fileName = './src/context/redirects.json';
    try {
      return require(fileName);
    } catch (e) {
      console.info(`❎ Redirects file ${fileName} not found`);
      return [];
    }
  },
};

module.exports = nextConfig;
