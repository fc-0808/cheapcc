/** @type {import('next').NextConfig} */
const nextConfig = {
	/* config options here */
	// No special configuration needed for webhooks
	// Just make sure your server is accessible via a public URL (e.g., using ngrok)
	// Make sure client-side env vars are properly exposed
	env: {
		// Expose PAYPAL_CLIENT_ID directly to the client
		NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
		NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
		NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				pathname: '**',
			},
		],
	},
	typescript: {
		// !! WARN !!
		// Dangerously allow production builds to successfully complete even if
		// your project has type errors.
		// !! WARN !!
		ignoreBuildErrors: true,
	},
}

module.exports = nextConfig
