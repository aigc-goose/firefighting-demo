import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 配置路由信息
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/main',
  },
  {
    name: 'main',
    path: '/main',
    component: () => import('/@/views/main/MainPage.vue'),
    children: [],
  },
]

const router = createRouter({
  routes,
  history: createWebHistory(),
})

export default router
