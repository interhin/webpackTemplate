// npm install postcss-loader autoprefixer css-mqpacker cssnano --save-dev

module.exports = {
  plugins: [
    require('autoprefixer'), // Расставление префиксов для свойств
    require('css-mqpacker'), // Минификация media запросов
    require('cssnano')({ // Минификация
      preset: [
        'default', {
          discardComments: { // Удаление всех комментов в scss
            removeAll: true,
          }
        }
      ]
    })
  ]
};
