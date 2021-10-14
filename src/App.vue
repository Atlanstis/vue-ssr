<template>
  <!-- 客户端渲染的入口节点 -->
  <div id="app">
    <h1>花非花，雾非雾。</h1>
    <input v-model="message" />
    <h2>{{ message }}</h2>
    <ul>
      <li>
        <router-link to="/">Home</router-link>
      </li>
      <li>
        <router-link to="/about">About</router-link>
      </li>
    </ul>

    <!-- 路由出口 -->
    <router-view />
  </div>
</template>
<script>
export default {
  name: 'App',

  data() {
    return {
      message: '夜半来，天明去。'
    }
  }
}
</script>
<style></style>
