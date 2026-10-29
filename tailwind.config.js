module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}", // Example for a typical src folder setup
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#17213A',
          950: '#0D1428',
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
        display: ['Manrope', 'DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};