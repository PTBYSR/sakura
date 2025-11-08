/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3e5f5',
          100: '#e1bee7',
          200: '#ce93d8',
          300: '#ba68c8',
          400: '#ab47bc',
          500: '#9c27b0',
          600: '#8e24aa',
          700: '#7b1fa2',
          800: '#6a1b9a',
          900: '#4a148c',
        },
        sakura: {
          50: '#FFF0F5',
          100: '#FFE0EB',
          200: '#FFC1D7',
          300: '#FFA3C3',
          400: '#FF84AF',
          500: '#FF6B9D', // Primary vibrant pink
          600: '#FF5C8D', // Gradient end
          700: '#E94B7C',
          800: '#D43A6B',
          900: '#BF295A',
        },
        dark: {
          bg: '#121212',
          surface: '#1e1e1e',
          paper: '#2d2d2d',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}


