const merge = require('webpack-merge'); // Плагин для слияний
const baseWebpackConfig = require('./webpack.base.conf'); // Подключаем базовый конфиг (общий для development и production)

const buildWebpackConfig = merge(baseWebpackConfig, { // Сливаем вместе базовый и текущий конфиг
  // BUILD config
  mode: 'production',
  plugins: []
});

module.exports = new Promise((resolve, reject) => {
  resolve(buildWebpackConfig)
});