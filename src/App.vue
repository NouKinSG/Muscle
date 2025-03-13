<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup>
// App.vue作为根组件，主要负责布局和路由视图的渲染
</script>

<style lang="scss">
.app-container {
  width: 100%;
  height: 100%;
  min-height: 100vh;
}
</style>