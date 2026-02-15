const nextConfig = {
  basePath: '/web',
  serverExternalPackages: ['mysql2'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/aida-public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/web',
        permanent: true,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
