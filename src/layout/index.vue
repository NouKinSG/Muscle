<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <header class="layout-header">
      <div class="header-left">
        <div class="logo">
          <img src="@/assets/images/logo.png" alt="Logo" class="logo-img" />
          <span class="logo-text">Muscle</span>
        </div>
        <nav class="main-nav">
          <router-link to="/layout/plan" class="nav-item">日历</router-link>
          <router-link to="/layout/practice" class="nav-item">练习</router-link>
          <router-link to="/layout/statistics" class="nav-item">数据分析</router-link>
          <router-link to="/layout/profile" class="nav-item">做题记录</router-link>
        </nav>
      </div>
      <div class="header-right">
        <el-input
          placeholder="搜索..."
          prefix-icon="el-icon-search"
          class="search-input"
        ></el-input>
        <div class="user-info">
          <el-dropdown trigger="click">
            <div class="user-avatar">
              <el-avatar :size="40" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
              <span class="username">张小明</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>
    
    <!-- 主内容区域 -->
    <main class="layout-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// 布局组件，包含顶部导航栏和主内容区域
</script>

<style lang="scss" scoped>
.layout-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 40px;
  
  .logo-img {
    width: 36px;
    height: 36px;
    margin-right: 10px;
  }
  
  .logo-text {
    font-size: 20px;
    font-weight: bold;
    color: var(--primary-color);
  }
}

.main-nav {
  display: flex;
  align-items: center;
  height: 100%;
  
  .nav-item {
    padding: 0 20px;
    height: 60px;
    line-height: 60px;
    color: var(--text-regular);
    text-decoration: none;
    font-size: 16px;
    transition: all 0.3s;
    
    &:hover, &.router-link-active {
      color: var(--primary-color);
      background-color: rgba(64, 158, 255, 0.1);
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
}

.search-input {
  width: 200px;
  margin-right: 20px;
}

.user-info {
  cursor: pointer;
}

.user-avatar {
  display: flex;
  align-items: center;
  
  .username {
    margin-left: 10px;
    font-size: 14px;
    color: var(--text-regular);
  }
}

.layout-content {
  flex: 1;
  overflow: auto;
  background-color: var(--background-color);
  padding: 20px;
}
</style>