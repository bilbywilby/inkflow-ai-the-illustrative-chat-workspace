/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['Inter', 'sans-serif'],
  			sketch: ['Fredericka the Great', 'cursive'],
  			mono: ['JetBrains Mono', 'monospace']
  		},
  		boxShadow: {
  			hard: '4px 4px 0px 0px #2c2c2c',
  			'hard-lg': '8px 8px 0px 0px #2c2c2c',
  			'hard-sm': '2px 2px 0px 0px #2c2c2c'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")]
}