/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        default: 'rgb(10, 8, 27)',
        beige: '#FFF4E2'
      },
      fontFamily:{
        josefin: ["Josefin Sans", 'sans-serif'],
        jost: ["Jost", 'sans-serif'],
      }
    },
  },
  plugins: [],
}