/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3499c5',  // light navy
        base: '#e5ebee',  // light
        secondary: "#009379",
        secondary_dark: "#266d60",


      },
    },
  },
  plugins: [],
}

