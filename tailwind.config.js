/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Quicksand', 'Nunito', 'sans-serif'],
        display: ['Nunito', 'Quicksand', 'sans-serif'],
      },
      colors: {
        morning: {
          pink: '#ffdfdf',
          peach: '#ffe9d6',
          apricot: '#ffd6ba',
          amber: '#f59e0b',
          sun: '#fb923c',
        }
      },
      boxShadow: {
        'glass': '0 20px 40px -15px rgba(255, 140, 107, 0.18), inset 0 0 15px 0 rgba(255, 255, 255, 0.6)',
        'glass-hover': '0 12px 24px -6px rgba(251, 146, 60, 0.35)',
      }
    },
  },
  plugins: [],
}