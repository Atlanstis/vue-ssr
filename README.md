# vue-ssr

> 参考资料：[Vue SSR 指南](https://ssr.vuejs.org/zh/)

## 构建配置

### 安装依赖

1. 生产依赖

   ```shell
   yarn add vue vue-server-renderer express cross-env
   ```

   | 包                  | 说明                                |
   | ------------------- | ----------------------------------- |
   | vue                 | Vue.js 核心库                       |
   | vue-server-renderer | Vue 服务端渲染工具                  |
   | express             | 基于 Node 的 Web 服务框架           |
   | cross-env           | 通过 npm scripts 设置跨平台环境变量 |

2. 安装开发依赖

   ```shell
   yarn add webpack webpack-cli webpack-merge webpack-node-externals @babel/core @babel/plugin-transform-runtime @babel/preset-env babel-loader css-loader url-loader file-loader rimraf vue-loader vue-template-compiler friendly-errors-webpack-plugin -D
   ```

   | 包                                                           | 说明                                     |
   | ------------------------------------------------------------ | ---------------------------------------- |
   | webpack                                                      | webpack 核心包                           |
   | webpack-cli                                                  | webpack 的命令行工具                     |
   | webpack-merge                                                | webpack 配置信息合并工具                 |
   | webpack-node-externals                                       | 排除 webpack 中的 Node 模块              |
   | rimraf                                                       | 基于 Node 封装的一个跨平台 `rm -rf` 工具 |
   | friendly-errors-webpack-plugin                               | 友好的 webpack 错误提示                  |
   | @babel/core<br />@babel/plugin-transform-runtime<br />@babel/preset-env<br />babel-loader | Babel 相关工具                           |
   | vue-loader<br />vue-template-compiler                        | 处理 .vue 资源                           |
   | file-loader                                                  | 处理字体资源                             |
   | css-loader                                                   | 处理 CSS 资源                            |
   | url-loader                                                   | 处理图片资源                             |

### 配置文件及打包命令

1. 初始化 webpack 打包配置文件

   ```
   build
   ├── webpack.base.config.js # 公共配置
   ├── webpack.client.config.js # 客户端打包配置文件
   └── webpack.server.config.js # 服务端打包配置文件
   ```

   webpack.base.config.js 

   ```js
   /**
    * 公共配置
    */
   const VueLoaderPlugin = require('vue-loader/lib/plugin')
   const path = require('path')
   const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
   const resolve = file => path.resolve(__dirname, file)
   
   const isProd = process.env.NODE_ENV === 'production'
   
   module.exports = {
     mode: isProd ? 'production' : 'development',
     output: {
       path: resolve('../dist/'),
       publicPath: '/dist/',
       filename: '[name].[chunkhash].js'
     },
     resolve: {
       alias: {
         // 路径别名，@ 指向 src
         '@': resolve('../src/')
       },
       // 可以省略的扩展名
       // 当省略扩展名的时候，按照从前往后的顺序依次解析
       extensions: ['.js', '.vue', '.json']
     },
     devtool: isProd ? 'source-map' : 'cheap-module-eval-source-map',
     module: {
       rules: [
         // 处理图片资源
         {
           test: /\.(png|jpg|gif)$/i,
           use: [
             {
               loader: 'url-loader',
               options: {
                 limit: 8192,
               },
             },
           ],
         },
   
         // 处理字体资源
         {
           test: /\.(woff|woff2|eot|ttf|otf)$/,
           use: [
             'file-loader',
           ],
         },
   
         // 处理 .vue 资源
         {
           test: /\.vue$/,
           loader: 'vue-loader'
         },
   
         // 处理 CSS 资源
         // 它会应用到普通的 `.css` 文件
         // 以及 `.vue` 文件中的 `<style>` 块
         {
           test: /\.css$/,
           use: [
             'vue-style-loader',
             'css-loader'
           ]
         },
         
         // CSS 预处理器，参考：https://vue-loader.vuejs.org/zh/guide/pre-processors.html
         // 例如处理 Less 资源
         // {
         //   test: /\.less$/,
         //   use: [
         //     'vue-style-loader',
         //     'css-loader',
         //     'less-loader'
         //   ]
         // },
       ]
     },
     plugins: [
       new VueLoaderPlugin(),
       new FriendlyErrorsWebpackPlugin()
     ]
   }
   ```

   webpack.client.config.js

   ```js
   /**
    * 客户端打包配置
    */
   const { merge } = require('webpack-merge')
   const baseConfig = require('./webpack.base.config.js')
   const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
   
   module.exports = merge(baseConfig, {
     entry: {
       app: './src/entry-client.js'
     },
   
     module: {
       rules: [
         // ES6 转 ES5
         {
           test: /\.m?js$/,
           exclude: /(node_modules|bower_components)/,
           use: {
             loader: 'babel-loader',
             options: {
               presets: ['@babel/preset-env'],
               cacheDirectory: true,
               plugins: ['@babel/plugin-transform-runtime']
             }
           }
         },
       ]
     },
   
     // 重要信息：这将 webpack 运行时分离到一个引导 chunk 中，
     // 以便可以在之后正确注入异步 chunk。
     optimization: {
       splitChunks: {
         name: "manifest",
         minChunks: Infinity
       }
     },
   
     plugins: [
       // 此插件在输出目录中生成 `vue-ssr-client-manifest.json`。
       new VueSSRClientPlugin()
     ]
   })
   ```

   webpack.server.config.js 

   ```js
   /**
    * 服务端打包配置
    */
   const { merge } = require('webpack-merge')
   const nodeExternals = require('webpack-node-externals')
   const baseConfig = require('./webpack.base.config.js')
   const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
   
   module.exports = merge(baseConfig, {
     // 将 entry 指向应用程序的 server entry 文件
     entry: './src/entry-server.js',
   
     // 这允许 webpack 以 Node 适用方式处理模块加载
     // 并且还会在编译 Vue 组件时，
     // 告知 `vue-loader` 输送面向服务器代码(server-oriented code)。
     target: 'node',
   
     output: {
       filename: 'server-bundle.js',
       // 此处告知 server bundle 使用 Node 风格导出模块(Node-style exports)
       libraryTarget: 'commonjs2'
     },
   
     // 不打包 node_modules 第三方包，而是保留 require 方式直接加载
     externals: [nodeExternals({
       // 白名单中的资源依然正常打包
       allowlist: [/\.css$/]
     })],
   
     plugins: [
       // 这是将服务器的整个输出构建为单个 JSON 文件的插件。
       // 默认文件名为 `vue-ssr-server-bundle.json`
       new VueSSRServerPlugin()
     ]
   })
   ```

   

