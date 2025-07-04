/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
	reactStrictMode: process.env.NODE_ENV === 'development', // Only enable in development
	// Force dynamic rendering for blog content
	staticPageGenerationTimeout: 300, // Increased from 120 to 300 seconds
	// Disable etags for better cache control
	generateEtags: false, // Disable etags for better cache control
	// Add specific configuration for blog routes
	async headers() {
		return [
			{
				source: '/blog/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'no-store, max-age=0',
					},
				],
			},
		]
	},
	env: {
		NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
		NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
		NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				pathname: '**',
			},
		],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		formats: ['image/avif', 'image/webp'],
		minimumCacheTTL: 60 * 60 * 24 * 7, // Cache images for a week
	},
	experimental: {
		outputFileTracing: true,
		optimizeCss: true,
		// Enable optimized package imports to reduce bundle size
		optimizePackageImports: ['framer-motion', 'date-fns', 'lodash', 'three', 'react-google-recaptcha'],
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	// Improve output compression for faster load times
	compress: true,
	// Avoid adding X-Powered-By header
	poweredByHeader: false,
	// Disable CSS processing to bypass the error
	webpack: (config) => {
		// Find and disable the CSS minimizer
		if (config.optimization && config.optimization.minimizer) {
			config.optimization.minimizer = config.optimization.minimizer.filter((minimizer) => !minimizer.constructor.name.includes('CssMinimizerPlugin'))
		}
		return config
	},
}

module.exports = withBundleAnalyzer(nextConfig)
