/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				'neo-bg': '#dedede',
				'neo-shadow-dark': '#b2b2b2',
				'neo-shadow-light': '#ffffff',
			},
			boxShadow: (theme) => ({
				neo: `8px 8px 18px ${theme('colors.neo-shadow-dark')}, -10px -10px 24px ${theme(
					'colors.neo-shadow-light'
				)}`,
			}),
		},
	},
	plugins: [],
};
