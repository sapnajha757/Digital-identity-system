/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      return [];
    }

    return [
      {
        source: "/auth/v1/:path*",
        destination: `${supabaseUrl}/auth/v1/:path*`,
      },
      {
        source: "/rest/v1/:path*",
        destination: `${supabaseUrl}/rest/v1/:path*`,
      },
      {
        source: "/storage/v1/:path*",
        destination: `${supabaseUrl}/storage/v1/:path*`,
      },
    ];
  },
};
module.exports = nextConfig;
