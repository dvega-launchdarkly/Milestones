/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co', // Spotify album art CDN
      },
      {
        protocol: 'https',
        hostname: 'image-cdn-ak.spotifycdn.com',
      },
      {
        protocol: 'https',
        hostname: 'image-cdn-fa.spotifycdn.com',
      },
      {
        protocol: 'https',
        hostname: 'mosaic.scdn.co', // Spotify playlist/artist images
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com', // For user profiles if needed
      },
    ],
  },
}

module.exports = nextConfig
