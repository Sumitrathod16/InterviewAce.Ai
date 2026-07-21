/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        secondaryBg: "rgb(var(--secondary-bg) / <alpha-value>)",
        white: "rgb(var(--white) / <alpha-value>)",
        lightGray: "rgb(var(--light-gray) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
