/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    'tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
