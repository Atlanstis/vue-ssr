const Vue = require('vue')
const fs = require('fs')
const renderer = require('vue-server-renderer').createRenderer({
  template: fs.readFileSync('./index.template.html', 'utf-8')
})
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
    res.end(html)
  })
})

server.listen(3000, () => {
  console.log('server running at port 3000.')
})
