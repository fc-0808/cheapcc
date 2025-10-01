// SEO-focused Next.js configuration enhancements
// This file contains additional optimizations for SEO performance

const SEOOptimizations = {
	// Enhanced image optimization for SEO
	images: {
		// Additional device sizes for better responsive images
		deviceSizes: [320, 420, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 640],

		// Modern formats for better performance
		formats: ['image/avif', 'image/webp'],

		// Longer cache for better SEO performance
		minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days

		// Quality settings for different use cases
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

		// Domains for external images
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname: 'cdn.cheapcc.online',
				pathname: '**',
			},
		],
	},

	// Enhanced headers for SEO
	async headers() {
		return [
			// Global headers for all routes
			{
				source: '/(.*)',
				headers: [
					// Security headers for SEO trust signals
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'X-Frame-Options',
						value: 'DENY',
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
						value: 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
					},
				],
			},

			// Static assets caching for performance
			{
				source: '/favicon.ico',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
			{
				source: '/(.*\\.(css|js|woff|woff2|ttf|otf|eot))',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},

			// Image caching
			{
				source: '/(.*\\.(png|jpg|jpeg|gif|webp|avif|svg|ico))',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},

			// API routes caching
			{
				source: '/api/(.*)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=300, stale-while-revalidate=600',
					},
				],
			},

			// Sitemap and robots caching
			{
				source: '/(sitemap.xml|robots.txt)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=3600, stale-while-revalidate=86400',
					},
				],
			},
		]
	},

	// Enhanced redirects for SEO
	async redirects() {
		return [
			// Redirect common variations to canonical URLs
			{
				source: '/home',
				destination: '/',
				permanent: true,
			},
			{
				source: '/index',
				destination: '/',
				permanent: true,
			},
			{
				source: '/pricing',
				destination: '/#pricing',
				permanent: true,
			},
			{
				source: '/contact',
				destination: 'mailto:support@cheapcc.online',
				permanent: true,
			},
			// Redirect old blog URLs if any
			{
				source: '/articles/:slug',
				destination: '/blog/:slug',
				permanent: true,
			},
		]
	},

	// Rewrites for SEO-friendly URLs
	async rewrites() {
		return [
			// API rewrites for cleaner URLs
			{
				source: '/health',
				destination: '/api/health',
			},
		]
	},

	// Experimental features for better SEO performance
	experimental: {
		// Enable optimized CSS
		optimizeCss: true,

		// Enable optimized package imports
		optimizePackageImports: ['framer-motion', 'date-fns', 'lodash', 'react-google-recaptcha', '@stripe/stripe-js'],

		// Better scroll restoration
		scrollRestoration: true,

		// Enable modern bundling
		esmExternals: true,

		// Enable server components optimization
		serverComponentsExternalPackages: ['sharp'],
	},

	// Webpack optimizations for SEO performance
	webpack: (config, { dev, isServer }) => {
		// Production optimizations
		if (!dev) {
			// Enable tree shaking
			config.optimization.usedExports = true

			// Optimize chunks for better caching
			config.optimization.splitChunks = {
				chunks: 'all',
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendors',
						chunks: 'all',
					},
					common: {
						name: 'common',
						minChunks: 2,
						chunks: 'all',
						enforce: true,
					},
				},
			}
		}

		// Optimize bundle analyzer
		if (process.env.ANALYZE === 'true') {
			const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
			config.plugins.push(
				new BundleAnalyzerPlugin({
					analyzerMode: 'static',
					openAnalyzer: false,
					reportFilename: isServer ? 'server-bundle-report.html' : 'client-bundle-report.html',
				})
			)
		}

		return config
	},

	// Compiler optimizations
	compiler: {
		// Remove console logs in production
		removeConsole: process.env.NODE_ENV === 'production',
	},

	// Output optimization
	output: 'standalone',

	// Enable compression
	compress: true,

	// Remove powered by header
	poweredByHeader: false,

	// Generate ETags for better caching
	generateEtags: true,

	// Page extensions for better organization
	pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

	// Trailing slash handling for consistent URLs
	trailingSlash: false,
}

module.exports = SEOOptimizations
