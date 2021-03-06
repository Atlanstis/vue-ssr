import Vue from 'vue'
import App from './App.vue'
import { createRouter } from '@/router'
import VueMeta from 'vue-meta'

Vue.use(VueMeta)

Vue.mixin({
  metaInfo: {
    titleTemplate: '%s - 花非花，雾非雾。'
  }
})

// 导出一个工厂函数，用于创建新的
// 应用程序、router 和 store 实例
export function createApp() {
  const router = createRouter()
  const app = new Vue({
    router, // 把路由挂载到 Vue 根实例中
    // 根实例简单的渲染应用程序组件。
    render: (h) => h(App)
  })
  return { app, router }
}
