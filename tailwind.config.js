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
          DEFAULT: "#880808",
          hover: "#700707",
          light: "#a31212",
        },
        cherry: {
          50: "#FDF2F2",
          100: "#FAE1E1",
          200: "#F5ADAD",
          300: "#E86B6B",
          400: "#CC2B2B",
          500: "#A31212",
          600: "#880808",
          700: "#700707",
          800: "#550505",
          900: "#3D0303",
          950: "#260202",
          DEFAULT: "#880808",
          dark: "#700707",
          ruby: "#880808",
        },
        bgmain: "#FFFFFF",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
