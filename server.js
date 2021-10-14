const fs = require('fs')
const express = require('express')
const server = express()
const { createBundleRenderer } = require('vue-server-renderer')
const setupDevServer = require('./build/setup-dev-server')

let renderer
let onReady
const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  const template = fs.readFileSync('./index.template.html', 'utf-8')
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')
  renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest
  })
} else {
  // 开发模式 -> 监视打包构建 -> 重新生成 Renderer 渲染器
  onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
    renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest
    })
  })
}

// express.static 处理物理磁盘中的资源文件
server.use('/dist', express.static('./dist'))

const render = (req, res) => {
  // 将 Vue 实例渲染为 HTML
  renderer.renderToString(
    {
      title: '花非花，雾非雾。',
      meta: `<meta name="description" content="花非花，雾非雾。夜半来，天明去。来如春梦几多时，去似朝云无觅处。">`
    },
    (err, html) => {
      if (err) {
        res.status(500).end('Internal Server Error.')
      }
      // 设置编码格式
      res.setHeader('Content-Type', 'text/html; charset=utf8')
      res.end(html)
    }
  )
}

server.get(
  '/',
  isProd
    ? render
    : async (req, res) => {
        // 等待有了 Renderer 渲染器后，调用 renderer 进行渲染
        await onReady
        render(req, res)
      }
)

server.listen(3000, () => {
  console.log('server running at port 3000.')
})
