const path = require('path');

module.exports = {
  entry: './src/index.js', // Giriş dosyası
  output: {
    path: path.resolve(__dirname, 'public'), // Çıkış dizini
    filename: 'bundle.js', // Çıkış dosyası
  },
  mode: 'development', // Geliştirme modu
  module: {
    rules: [
      {
        test: /\.jsx?$/, // .js ve .jsx dosyalarını işlemek için
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/, // .css dosyalarını işlemek için
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devServer: {
    static: path.resolve(__dirname, 'public'), // Statik dosyaların yolu
    port: 8080, // Geliştirme sunucusu portu
    open: true, // Tarayıcıyı otomatik aç
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Uzantıları çözümle
  },
};