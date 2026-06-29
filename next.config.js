/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@napi-rs/canvas', 'fake-ff')
    }
    return config
  },
}
module.exports = nextConfig
