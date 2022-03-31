function getAssetPrefix() {
  if (process.env.GITHUB_ACTIONS === 'true') {
    const [, repo] = process.env.GITHUB_REPOSITORY.split('/');
    return `/${repo.toLowerCase()}/`;
  }

  return '';
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  assetPrefix: getAssetPrefix(),
  env: {
    VERSION: process.env.VERSION,
  },
};

module.exports = nextConfig;
