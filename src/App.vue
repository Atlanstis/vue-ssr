<template>
  <!-- 客户端渲染的入口节点 -->
  <div id="app">
    <h1>花非花，雾非雾。</h1>
    <input v-model="message" />
    <h2>{{ message }}</h2>
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
