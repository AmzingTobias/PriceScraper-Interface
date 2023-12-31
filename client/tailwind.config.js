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
      width: {
        160: "40rem",
        120: "30rem",
      },
      height: {
        160: "40rem",
        120: "30rem",
      },
      screens: {
        "3xl": "1664px",
        "4xl": "1792px",
        "5xl": "1920px",
      },
    },
  },
  plugins: [],
};
