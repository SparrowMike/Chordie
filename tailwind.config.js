/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			transitionProperty: {
				height: 'height',
			},
			colors: {
				'neo-bg': '#dedede',
				'neo-shadow-dark': '#b2b2b2',
				'neo-shadow-light': '#ffffff',

				C: '#FF0000',
				'C#': '#FF4000',
				D: '#FF8000',
				'D#': '#FFBF00',
				E: '#FFFF00',
				F: '#BFFF00',
				'F#': '#80FF00',
				G: '#40FF00',
				'G#': '#00FF00',
				A: '#00FF40',
				'A#': '#00FF80',
				B: '#00FFBF',
			},
			boxShadow: (theme) => ({
				neo: `8px 8px 18px ${theme('colors.neo-shadow-dark')}, -10px -10px 24px ${theme(
					'colors.neo-shadow-light'
				)}`,
			}),
			transitionDuration: {
				DEFAULT: '300ms',
			},
		},
	},
	plugins: [],
};
