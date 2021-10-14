const Vue = require('vue')
const fs = require('fs')

const serverBundle = require('./dist/vue-ssr-server-bundle.json')
const template = fs.readFileSync('./index.template.html', 'utf-8')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')

const renderer = require('vue-server-renderer').createBundleRenderer(
  serverBundle,
  {
    template,
    clientManifest
  }
)
const express = require('express')
const server = express()

server.use('/dist', express.static('./dist'))

server.get('/', (req, res) => {
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
})

server.listen(3000, () => {
  console.log('server running at port 3000.')
})
