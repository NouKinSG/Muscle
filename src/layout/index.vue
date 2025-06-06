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
          <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
            <el-menu-item index="/layout/plan">
              日历
            </el-menu-item>
            <el-menu-item index="/layout/practice">
              练习
            </el-menu-item>
            <el-menu-item index="/layout/daily-recommendation">
              每日一题
            </el-menu-item>
            <el-menu-item index="/layout/statistics">
              数据分析
            </el-menu-item>
            <el-menu-item index="/layout/profile">
              个人中心
            </el-menu-item>
          </el-menu>
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
import { ref, computed } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { getDailyTasks } from '@/api/practice'; // 导入 getDailyTasks

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const activeIndex = computed(() => {
  // 从当前路由路径中提取主要部分作为激活的菜单项
  const path = route.path;
  if (path.startsWith('/layout/plan')) return 'plan';
  if (path.startsWith('/layout/practice')) {
    if (path.includes('daily-recommendation')) return 'daily-recommendation';
    return 'practice';
  }
  if (path.startsWith('/layout/statistics')) return 'statistics';
  if (path.startsWith('/layout/profile')) return 'profile';
  return '';
});

const handleSelect = async (key) => {
  if (key === '/layout/practice') {
    try {
      const dailyTasksData = await getDailyTasks();
      // 后端返回的数据结构是 { code: 0, message: "成功", data: { date: "", tasks: [...] } }
      // request.js 中处理后，我们直接拿到 res.data，即 { date: "", tasks: [...] }
      if (dailyTasksData && dailyTasksData.tasks && dailyTasksData.tasks.length > 0) {
        const firstTask = dailyTasksData.tasks[0];
        router.push({ name: 'Practice', params: { questionId: firstTask.question_id } });
      } else {
        ElMessage.info('今日暂无练习任务');
        // 可选：跳转到题目列表页或日历页
        // router.push('/layout/calendar'); 
      }
    } catch (error) {
      ElMessage.error('获取每日任务失败，请稍后再试');
      console.error('Failed to fetch daily tasks:', error);
    }
  } else if (key === '/layout/daily-recommendation') {
    router.push({ name: 'DailyRecommendation' });
  } else {
    router.push(key);
  }
};

const logout = () => {
  userStore.logout();
  ElMessage.success('已退出登录');
  router.push('/login');
};

// 示例：获取用户信息，如果需要的话
// onMounted(() => {
//   if (!userStore.userInfo) {
//     userStore.fetchUserInfo().catch(err => {
//       ElMessage.error('获取用户信息失败: ' + err.message);
//     });
//   }
// });

const userName = computed(() => userStore.userInfo?.username || userStore.token?.substring(0, 6) || '用户');

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