/** @type {import('next').NextConfig} */

// Extract hostname from the backend URL for image optimisation
function getImagePatterns() {
  const patterns = [
    {
      protocol: "http",
      hostname: "localhost",
      port: "5000",
    },
  ];

  const backendUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (backendUrl) {
    try {
      const url = new URL(backendUrl);
      patterns.push({
        protocol: url.protocol.replace(":", ""),
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
      });
    } catch {
      // Invalid URL, skip
    }
  }

  return patterns;
}

const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: getImagePatterns(),
  },
};

module.exports = nextConfig;
