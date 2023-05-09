/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        walk: {
          "0%": { backgroundPositionX: 0 },
          "100%": { backgroundPositionX: -1365 },
        },
      },
    },
  },
  plugins: [],
};
