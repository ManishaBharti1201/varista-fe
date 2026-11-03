module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}", // Example for a typical src folder setup
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#1A233A',
          950: '#111A30',
        },
        indigo: {
          50: '#EEF2FF',
          100: '#DDE5FF',
          200: '#C6D2FF',
          300: '#A9BFFF',
          400: '#8298FF',
          500: '#5367F2',
          600: '#4354D8',
          700: '#3544B5',
          800: '#29358F',
          900: '#222D69',
          950: '#17213A',
        },
        blue: {
          50: '#EEF2FF',
          100: '#DDE5FF',
          200: '#C6D2FF',
          300: '#A9BFFF',
          400: '#8298FF',
          500: '#5367F2',
          600: '#4354D8',
          700: '#3544B5',
          800: '#29358F',
          900: '#222D69',
          950: '#17213A',
        },
        brand: {
          50: '#EEF2FF',
          100: '#DDE5FF',
          300: '#A9BFFF',
          500: '#5367F2',
          600: '#4354D8',
        },
        mint: {
          300: '#8DE8D5',
          500: '#16B8A6',
        },
        gold: {
          400: '#EABF4B',
        },
        coral: {
          500: '#F06B56',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Segoe UI', 'sans-serif'],
        display: ['Manrope', 'DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};