/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
			extend: {
			animation: {
				'nebula-drift': 'drift 60s linear infinite',
				'nebula-pulse': 'pulse 15s ease-in-out infinite',
				'nebula-float': 'float 40s ease-in-out infinite',
				'spotlight-premium': 'spotlight 20s ease infinite',
			},
			keyframes: {
				drift: {
					'0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
					'50%': { transform: 'translate(5%, 2%) rotate(5deg)' },
				},
				pulse: {
					'0%, 100%': { opacity: '0.3' },
					'50%': { opacity: '0.5' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-20px)' },
				},
				spotlight: {
					'0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
					'50%': { opacity: '0.5', transform: 'scale(1.1)' },
				},
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
	future: {
		hoverOnlyWhenSupported: true,
	},
}
