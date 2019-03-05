const webpack = require('webpack');
const merge = require('webpack-merge'); // Плагин для слияний
const baseWebpackConfig = require('./webpack.base.conf'); // Подключаем базовый конфиг (общий для development и production)

const devWebpackConfig = merge(baseWebpackConfig, { // Сливаем вместе базовый и текущий конфиг
  // DEV config
  mode: 'development',
  devtool: 'cheap-module-eval-source-map', // Выбор Source Map'а для того чтобы лучше дебажить код
  devServer: {
    contentBase: baseWebpackConfig.externals.paths.dist, // Путь к папке dist из нее локальный сервер будет брать файлы
    port: 8081,
    overlay: {
      warnings: true,
      errors: true
    }
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({ // Для корректной работы Source Map (указание дополнительных настроек)
      filename: '[file].map' // Указываем путь и имя файла карты
    })
  ]
});

module.exports = new Promise((resolve, reject) => {
  resolve(devWebpackConfig)
});
