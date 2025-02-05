/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,njk,md}"],
  theme: {
    extend: {
      fontFamily: {
        baskerville: ['Libre Baskerville', 'serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
