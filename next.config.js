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
					// Content Security Policy for Tawk.to, Stripe, PayPal, Supabase, and Vercel Analytics
					{
						key: 'Content-Security-Policy',
						value:
							"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://embed.tawk.to https://tawk.to https://va.tawk.to https://*.tawk.to https://www.googletagmanager.com https://cdnjs.cloudflare.com https://js.stripe.com https://www.paypal.com https://www.sandbox.paypal.com https://va.vercel-scripts.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://embed.tawk.to https://*.tawk.to https://use.fontawesome.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com https://use.fontawesome.com; img-src 'self' data: https: blob:; connect-src 'self' https://embed.tawk.to https://tawk.to https://va.tawk.to https://*.tawk.to wss://*.tawk.to https://api.paypal.com https://www.sandbox.paypal.com https://api.stripe.com https://vitals.vercel-insights.com https://*.supabase.co https://izidrmzvwdrzrlaexubt.supabase.co https://www.google.com; frame-src 'self' https://embed.tawk.to https://tawk.to https://*.tawk.to https://www.paypal.com https://www.sandbox.paypal.com https://js.stripe.com https://www.google.com; media-src 'self' https://embed.tawk.to https://*.tawk.to; object-src 'none'; base-uri 'self';",
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
		NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
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
		minimumCacheTTL: 60 * 60 * 24 * 7, // Cache images for a week
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
	webpack: (config) => {
		// Find and disable the CSS minimizer
		if (config.optimization && config.optimization.minimizer) {
			config.optimization.minimizer = config.optimization.minimizer.filter((minimizer) => !minimizer.constructor.name.includes('CssMinimizerPlugin'))
		}

		// Add support for touch events and gestures
		config.resolve.fallback = {
			...config.resolve.fallback,
			hammerjs: require.resolve('hammerjs'),
		}

		return config
	},
}

module.exports = withBundleAnalyzer(nextConfig)
