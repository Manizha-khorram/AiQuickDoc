/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ensure `onnxruntime-node` is not bundled in the client-side code
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "onnxruntime-node": false,
      };
    }

    return config;
  },
};

export default nextConfig;
