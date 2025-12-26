/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
      colors: {
        'sacred': {
          indigo: '#2c2f4a',
          gold: '#f5e9c8',
          white: '#faf8f1',
          emerald: '#3a7f6e',
        }
      },
      backgroundImage: {
        'spiritual-gradient': 'linear-gradient(135deg, #2c2f4a 0%, #3a7f6e 50%, #2c2f4a 100%)',
      }
    },
  },
  plugins: [],
};