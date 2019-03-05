const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // Плагин для того чтобы "отделить" css от js (чтобы css файл был в отдельной папке а не в теге <style>)
const CopyWebpackPlugin = require('copy-webpack-plugin'); // Плагин для копирования различных файлов из одного места в другое
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Плагин для создания html шаблона сайта
const CleanWebpackPlugin = require('clean-webpack-plugin'); // Плагин для очистки папок
const fs = require("fs"); // Модуль для чтение содержимого директорий

const PATHS = {
  src: path.join(__dirname, '../src'), // Путь к development версии
  dist: path.join(__dirname, '../dist'), // Путь к production версии
  assets: 'assets/' // Путь к img,css,js и тд... в production версии
}

function generateHtmlPlugins (templateDir) {
  // Считываем все файлы из директории переданной аргументом
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles.map(item => { // Генерируем с помощью map новый массив с экземплярами HtmlWebpackPlugin
    // Сплитим имя файла и расширение
    const parts = item.split('.');
    const name = parts[0];
    const extension = parts[1];
    // Возвращаем новый экземпляр HTMLWebpackPlugin для каждой html страницы
    return new HtmlWebpackPlugin({
      hash: false, // Хеширование отключено
      inject: false, // Отключение автоинжекта app.js/app.css в index.html
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`)
    })
  })
}
const htmlPlugins = generateHtmlPlugins(PATHS.src+"/pages/");

module.exports = {
  // BASE config
  externals: { // externals видем всем другим скриптам таким как webpack.build.conf.js и тд...
    paths: PATHS
  },
  entry: { // Точка входа
    app: PATHS.src+"/index.js"
  },
  output: { // Точка выхода
    path: PATHS.dist, // Путь к production версии
    publicPath: '/', // Для обновления URL внутри CSS и HTML-файлов во время генерации production-сборок. 
    filename: `${PATHS.assets}js/[name].js`, // Имя и путь основного js файла ([name] == названию свойства "app" выше (js/app.js)) 
  },
  module: {
    rules: [{
      test: /\.js$/, // Находим все js файлы
      loader: 'babel-loader', // Обрабатываем все js файлы babel'om
      exclude: /node_modules/ // Исключаем из обработки папку node_modules или так path.resolve(__dirname,'../node_modules/')
    },{
      test: /\.(woff2?|ttf|otf|eot)$/, // Загружаем все шрифты которые используются в css
      exclude: /node_modules/,
      loader: 'file-loader',
      options: {
          context: `${PATHS.src}/${PATHS.assets}fonts/`, // Чтобы убрать из пути src и fonts
          name: '[path][name].[ext]',
          outputPath: `${PATHS.assets}fonts/`,
          publicPath: '../fonts/'
      }
    },{
      test: /\.(png|jpg|gif|svg)$/, // Загружаем все картинки которые используются в css
      loader: 'file-loader',
      exclude: /node_modules/,
      options: {
        name: '[name].[ext]',
        publicPath: '../img/', // Замена всех путей для картинок на валидный
        outputPath: `${PATHS.assets}img/` // Сохранение всех картинок в assets/img
      }
    },{
      test: /\.scss$/, // Ищем все scss файлы
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
        },
        {
          loader: 'css-loader', // css-loader для возможности импортировать css в js
          options: { sourceMap: true },
        },{
          loader: 'resolve-url-loader' // Для корректной работы font-awesome с относительными путями
        }, {
          loader: 'postcss-loader', // postcss-loader для различных "post" оптимизаций таких как autoprefixer, cssnano и тд...
          options: { sourceMap: true, config: { path: `${PATHS.src}/${PATHS.assets}js/postcss.config.js` } }
        }, {
          loader: 'sass-loader', // Обработка scss файлов препроцессором sass
          options: { sourceMap: true }
        }
      ]
    },{
      test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/, // Парсинг font-awesome шрифтов
      include: /node_modules/,//[path.resolve(__dirname,'../node_modules/')],
      use: [{
          loader: 'file-loader',
          options: {
              name: '[name].[ext]',
              publicPath: '../fonts/font-awesome/',
              outputPath: PATHS.assets+'fonts/font-awesome/'
          }
      }]
    },{
      test: /\.html$/,
      include: path.resolve(__dirname,PATHS.src+"/pages/"),
      use: [
        {
          loader: 'raw-loader' // raw-loader не делает require картинок а просто копирует текст html
        }
      ]
    }]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `${PATHS.assets}css/[name].css`,// Указываем конечный путь основного css файла
    }),
    new HtmlWebpackPlugin({
      hash: false, // Хеширование отключено
      inject: false, // Отключение автоматического добавления js/css
      template: `${PATHS.src}/pages/index.html`, // Путь к шаблону
      filename: './index.html', // Путь к конечному файлу (относительно dist)
    }),
    new CopyWebpackPlugin([
      { from: `${PATHS.src}/static`, to: '' }, // Копирование все файлов из папки static в корень сайта
      { from: `${PATHS.src}/${PATHS.assets}img`, to: `${PATHS.assets}img`} // Загружаем всех картинки т.к. в html raw-loader
    ]),
    new CleanWebpackPlugin(),
  ].concat(htmlPlugins), // Добавляем в массив плагинов наши полученные html страницы
};
