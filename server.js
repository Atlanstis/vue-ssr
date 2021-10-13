const Vue = require('vue')
const renderer = require('vue-server-renderer').createRenderer()
const express = require('express')
const server = express()

server.get('/', (req, res) => {
  const app = new Vue({
    template: `<div id="app">{{ message }}</div>`,

    data: {
      message: '花非花，雾非雾。'
    }
  })

  // 将 Vue 实例渲染为 HTML
  renderer.renderToString(app, (err, html) => {
    if (err) {
      res.status(500).end('Internal Server Error.')
    }
    // 设置编码格式
    res.setHeader('Content-Type', 'text/html; charset=utf8')
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title></title>
        </head>
        <body>
        ${html}
        </body>
      </html>
      `)
  })
})

server.listen(3000, () => {
  console.log('server running at port 3000.')
})
