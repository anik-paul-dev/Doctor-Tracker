/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do not emit framework agent-instruction files into this application repo.
  agentRules: false,
  experimental: {
    // lucide-react is a large barrel export; optimize its named icon imports
    // so the first dev compile only processes the icons used by each route.
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
