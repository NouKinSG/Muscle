import { createRouter, createWebHistory } from 'vue-router'
import logger from '@/utils/logger'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/index.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/layout',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    redirect: '/layout/plan',
    children: [
      {
        path: 'plan',
        name: 'Plan',
        component: () => import('@/views/plan/index.vue'),
        meta: { title: '计划' }
      },
      {
        path: 'practice',
        name: 'Practice',
        component: () => import('@/views/practice/index.vue'),
        meta: { title: '练习' }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/index.vue'),
        meta: { title: '数据分析' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - Muscle` : 'Muscle - 算法刷题助手'
  
  // 记录路由导航日志
  logger.info(`路由导航: 从 ${from.path} 到 ${to.path}`, { to, from })
  
  // 登录验证逻辑
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && to.path !== '/register' && !token) {
    logger.warn('未登录，重定向到登录页')
    next('/login')
  } else {
    next()
  }
})

export default router