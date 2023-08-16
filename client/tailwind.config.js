/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      rotate: {
        60: "60deg",
      },
      boxShadow: {
        fillInsideRoundedFull: "inset 0 0 0 9999px",
      },
    },
  },
  plugins: [],
};