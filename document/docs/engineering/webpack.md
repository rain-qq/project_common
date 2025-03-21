## webpack是什么？

> webpack是一个模块打包工具，用于将多个模块合并成一个或多个bundle文件

## webpack的构建流程？

> 初始化参数 → 开始编译 → 确定入口 → 编译模块 → 完成编译 → 输出资源

## Webpack 中的 entry、output、loader 和 plugin 分别是什么？

- entry：入口文件。
- output：输出文件配置。
- loader：用于处理非 JavaScript 文件（如 CSS、图片）。
- plugin：用于扩展功能（如打包优化、资源管理）。

## 如何配置 Webpack 支持多入口文件？

```js
module.exports = {
  entry: {
    app: './src/app.js',
    admin: './src/admin.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: __dirname + '/dist',
  },
};
```

## 如何优化 Webpack 的构建速度？

- 使用 cache-loader 或 hard-source-webpack-plugin 缓存构建结果。
- 使用 thread-loader 开启多线程构建。
- 减少文件搜索范围（如配置 resolve.modules 和 resolve.extensions）。
- 使用 DllPlugin 预编译公共库。

## 如何实现代码分割（Code Splitting）

- 使用 import() 动态导入。
- optimization.splitChunks

```js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
```

## Loader 和 Plugin 的区别是什么？
- Loader 用于处理文件（如转换 TypeScript 或 SCSS）
- Plugin 用于扩展功能（如生成 HTML 文件或压缩代码）

#### 如何编写一个自定义 Loader？
```js
module.exports = function (source) {
  return source.replace('foo', 'bar');
};
```
```js
class MyPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('MyPlugin', (stats) => {
      console.log('Build is done!');
    });
  }
}
module.exports = MyPlugin;
```

## Webpack 的模块化是如何实现的？
Webpack 将所有模块包装成一个函数，通过 __webpack_require__ 实现模块的加载和执行

## Webpack 的热更新（HMR）是如何工作的？
- 通过 WebSocket 建立客户端和服务端的通信
- 在开发环境中，当源文件发生变化时，Webpack 会重新编译，并通过 WebSocket 将编译结果发送给客户端，客户端收到消息后，会更新页面

## Webpack 的 Tree Shaking 是如何实现的
- 通过 ES6 的模块语法，使用 import 和 export 关键字来导入和导出模块
- 需要配置 optimization.usedExports 和 package.json 中的 sideEffects

## 如何用 Webpack 实现一个多页应用
- 配置多个 entry
- 使用 html-webpack-plugin 生成多个 HTML 文件
```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: {
    page1: './src/page1.js',
    page2: './src/page2.js',
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/page1.html', filename: 'page1.html' }),
    new HtmlWebpackPlugin({ template: './src/page2.html', filename: 'page2.html' }),
  ],
};
```

## Webpack 5 有哪些新特性
- 内置静态资源模块（如 asset/resource）
- 模块联邦（Module Federation）
- 持久化缓存（Persistent Caching）

## 如何调试 Webpack 的构建过程
- node --inspect-brk ./node_modules/webpack/bin/webpack.js
- webpack-cli --inspect-brk
- 使用 webpack-dev-server 的 --watch-stats 或 --profile 选项
- 使用 stats 配置生成构建报告

