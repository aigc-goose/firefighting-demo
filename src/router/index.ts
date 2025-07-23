import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store'
import { getRoutesByRole, getDefaultRedirectByRole } from './routes'
import { UserRole } from '@/data/mock'

// 配置路由信息
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    name: 'main',
    path: '/main',
    component: () => import('@/views/main/MainPage.vue'),
    meta: {
      title: '主页',
      requiresAuth: true
    },
    children: [
      // 动态添加子路由
      ...getRoutesByRole(UserRole.CITIZEN),
      ...getRoutesByRole(UserRole.FIREFIGHTER)
    ],
  },
]

const router = createRouter({
  routes,
  history: createWebHistory(),
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 检查是否需要登录
  if (to.meta?.requiresAuth) {
    if (!authStore.isLoggedIn) {
      // 未登录，重定向到登录页
      next('/login')
      return
    }
    
    // 检查路由权限
    if (to.meta?.roles && authStore.userRole) {
      const allowedRoles = to.meta.roles as UserRole[]
      if (!allowedRoles.includes(authStore.userRole)) {
        // 没有权限访问该路由，重定向到默认页面
        const defaultPath = getDefaultRedirectByRole(authStore.userRole)
        next(defaultPath)
        return
      }
    }
    
    // 如果访问 /main，根据角色重定向到默认页面
    if (to.path === '/main' && authStore.userRole) {
      const defaultPath = getDefaultRedirectByRole(authStore.userRole)
      next(defaultPath)
      return
    }
  }
  
  // 如果已登录，访问登录页面时重定向到主页
  if (to.path === '/login' && authStore.isLoggedIn) {
    next('/main')
    return
  }
  
  next()
})

export default router
