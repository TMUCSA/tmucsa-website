/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true, // images will not be optimized TESTING
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'scontent.cdninstagram.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'scontent-yyz1-1.cdninstagram.com',
                pathname: '/**',
            }
        ],
    },
}

module.exports = nextConfig
