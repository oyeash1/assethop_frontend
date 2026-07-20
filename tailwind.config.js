/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#111827",
          dark: "#0b0f19",
          light: "#1f2937",
        },
        accent: {
          DEFAULT: "#7F2A3C",
          hover: "#6b2131",
          light: "#a33c52",
        },
        bgmain: "#F9FAFB",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
