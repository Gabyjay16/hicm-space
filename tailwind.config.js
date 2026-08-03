/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#fcfcfc', // off-white background
        foreground: '#0f172a', // deep navy text
        primary: {
          DEFAULT: '#0f172a', // deep navy
          light: '#1e293b'
        },
        accent: {
          DEFAULT: '#0d9488', // muted teal
          light: '#14b8a6'
        },
        border: '#e2e8f0', // thin separators
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // compact academic typography
      }
    },
  },
  plugins: [],
}
