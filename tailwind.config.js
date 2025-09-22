/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eefdf3',
          100: '#d6f7e2',
          200: '#adeeca',
          300: '#7fe1b1',
          400: '#4fd497',
          500: '#22c778',
          600: '#17a563',
          700: '#11804f',
          800: '#0c5d3b',
          900: '#083e29',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(34, 199, 120, 0.4)',
      },
      backgroundImage: {
        'grid': 'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}

