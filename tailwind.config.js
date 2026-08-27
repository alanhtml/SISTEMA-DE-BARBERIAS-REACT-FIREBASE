/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        primary: '#c5a059',
        surface: '#000000',
        'surface-variant': '#0a0a0a',
        'on-surface-variant': '#ffffff',
      },
      fontFamily: {
        headline: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
