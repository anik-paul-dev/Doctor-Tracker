/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // lucide-react is a large barrel export; optimize its named icon imports
    // so the first dev compile only processes the icons used by each route.
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
