/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        carmine: '#D7263D',
        burnt: '#FF6B35',
        golden: '#FFC857',
        charcoal: '#2B2B2B',
        graphite: '#3A3A3A',
        lightgray: '#E5E5E5',
      },
      backgroundImage: (theme) => ({
        fire: `linear-gradient(to right, ${theme('colors.carmine')}, ${theme('colors.burnt')}, ${theme('colors.golden')})`,
        'charcoal-glow': `linear-gradient(135deg, ${theme('colors.charcoal')}, #4A1C1C)`,
      }),
    },
  },
  plugins: [],
};
