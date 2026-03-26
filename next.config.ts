import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Permite imágenes desde cualquier dominio (Dropbox, Drive, Cloudinary, etc.)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
