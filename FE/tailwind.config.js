/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        customGray: "#7B7B7B",
      },
      animation: {
        pop: "pop 0.3s ease",}
    },
    keyframes: {
      pop: {
        "0%": { transform: "scale(1)" },
        "50%": { transform: "scale(1.3)" },
        "100%": { transform: "scale(1)" },
      },
    },
  },
  plugins: [],
};
