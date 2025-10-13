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
			// Mobile optimization headers
			{
				source: '/:path*',
				headers: [
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'X-XSS-Protection',
						value: '1; mode=block',
					},
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
					{
						key: 'Permissions-Policy',
						value: 'accelerometer=*, camera=*, geolocation=*, gyroscope=*, magnetometer=*, microphone=*, payment=*, usb=*',
					},
					// Content Security Policy - More permissive for PayPal compatibility
					{
						key: 'Content-Security-Policy',
						value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data: blob:; style-src 'self' 'unsafe-inline' https: http: data:; font-src 'self' data: https: http:; img-src 'self' data: https: http: blob:; connect-src 'self' https: http: wss: ws:; frame-src 'self' https: http:; media-src 'self' https: http: data: blob:; object-src 'none'; base-uri 'self';",
					},
					// Optimize mobile caching with stale-while-revalidate
					{
						key: 'Cache-Control',
						value: 'public, max-age=3600, stale-while-revalidate=86400',
					},
				],
			},
		]
	},
	env: {
		// PayPal Client ID with guaranteed fallback
		NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AdnhpzgXSmFsoZv7VDuwS9wJo8czKZy6hBPFMqFuRpgglopk5bT-_tQLsM4hwiHtt_MZOB7Fup4MNTWe',
		// Hardcoded fallback for production
		PAYPAL_CLIENT_ID_FALLBACK: 'AdnhpzgXSmFsoZv7VDuwS9wJo8czKZy6hBPFMqFuRpgglopk5bT-_tQLsM4hwiHtt_MZOB7Fup4MNTWe',
		NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
		NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
		// ngrok configuration
		NGROK_URL: process.env.NGROK_URL,
		FORCE_NGROK_FOR_WEBHOOKS: process.env.FORCE_NGROK_FOR_WEBHOOKS,
	},
	// Runtime config for ngrok API base URL (for API calls only)
	publicRuntimeConfig: {
		ngrokUrl: process.env.NODE_ENV === 'development' && process.env.NGROK_URL && !process.env.NGROK_URL.includes('your-ngrok-url') ? process.env.NGROK_URL : '',
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
		minimumCacheTTL: 31536000, // 1 year cache for better Core Web Vitals
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data: blob:; style-src 'self' 'unsafe-inline' https: http: data:; font-src 'self' data: https: http:; img-src 'self' data: https: http: blob:; connect-src 'self' https: http: wss: ws:; frame-src 'self' https: http:; media-src 'self' https: http: data: blob:; object-src 'none'; base-uri 'self';",
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'cheapcc.online',
			},
			{
				protocol: 'https',
				hostname: '*.cheapcc.online',
			},
		],
	},
	experimental: {
		optimizeCss: true,
		// Enable optimized package imports to reduce bundle size
		optimizePackageImports: ['framer-motion', 'date-fns', 'lodash', 'three', 'react-google-recaptcha'],
		// Improved mobile performance features
		scrollRestoration: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	// Improve output compression for faster load times
	compress: true,
	// Avoid adding X-Powered-By header
	poweredByHeader: false,
	// Disable CSS processing to bypass the error
	webpack: (config, { isServer }) => {
		// Find and disable the CSS minimizer
		if (config.optimization && config.optimization.minimizer) {
			config.optimization.minimizer = config.optimization.minimizer.filter((minimizer) => !minimizer.constructor.name.includes('CssMinimizerPlugin'))
		}

		// Exclude server-only modules from client bundle
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				hammerjs: require.resolve('hammerjs'),
				// Exclude Node.js modules from client bundle
				fs: false,
				path: false,
				crypto: false,
				stream: false,
				util: false,
				buffer: false,
				assert: false,
				os: false,
			}

			// Exclude server-only files from client bundle
			config.resolve.alias = {
				...config.resolve.alias,
				'@/utils/supabase/supabase-server': false,
				'@/utils/products-server': false,
			}
		} else {
			// Server-side fallbacks
			config.resolve.fallback = {
				...config.resolve.fallback,
				hammerjs: require.resolve('hammerjs'),
			}
		}

		return config
	},
}

module.exports = withBundleAnalyzer(nextConfig)
