/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#FFF5E6',
          100: '#FFE6CC',
          200: '#FFCC99',
          300: '#FFB366',
          400: '#FF9933',
          500: '#FF6600',
          600: '#CC5200',
          700: '#993D00',
          800: '#662900',
          900: '#331400',
        },
        maroon: {
          50: '#F5E6E6',
          100: '#EBCCCC',
          200: '#D69999',
          300: '#C26666',
          400: '#AD3333',
          500: '#990000',
          600: '#7A0000',
          700: '#5C0000',
          800: '#3D0000',
          900: '#1F0000',
        },
      },
    },
  },
  plugins: [],
}

