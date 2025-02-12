/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',  // Wildcard for any hostname
                pathname: '/**', // Wildcard for any pathname
            }
        ],
    },
}

module.exports = nextConfig
