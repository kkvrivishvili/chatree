const { plugins } = require("./postcss.config");

module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},  // Cambio por nesting nativo de Tailwind 3
    'tailwindcss': {},          // Plugin principal de Tailwind
    'autoprefixer': {},
  }
};
