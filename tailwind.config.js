/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#E2D4C1',
          DEFAULT: '#C5A880',
          dark: '#A68A64',
          metallic: '#D4AF37',
          deep: '#B89047',
          accent: '#AA7C11',
        },
        dark: {
          950: '#070708',
          900: '#0D0D0E',
          800: '#141416',
          700: '#1C1C1F',
          600: '#28282D',
          500: '#3D3D45',
        },
      },
      fontFamily: {
        title: ['Cinzel', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #B89047 0%, #D4AF37 50%, #E6D5B8 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0D0D0E 0%, #070708 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(197, 168, 128, 0.2)',
        'gold-glow-lg': '0 0 30px rgba(212, 175, 55, 0.3)',
      },
    },
  },
  plugins: [],
}
