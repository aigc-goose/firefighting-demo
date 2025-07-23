import type { RouteRecordRaw } from 'vue-router'
import { UserRole } from '@/data/mock'

// 普通用户路由
export const citizenRoutes: RouteRecordRaw[] = [
  {
    path: 'report',
    name: 'EventReport',
    component: () => import('@/views/citizen/EventReport.vue'),
    meta: {
      title: '事件上报',
      roles: [UserRole.CITIZEN]
    }
  },
  {
    path: 'my-reports',
    name: 'MyReports',
    component: () => import('@/views/citizen/MyReports.vue'),
    meta: {
      title: '我的上报',
      roles: [UserRole.CITIZEN]
    }
  }
]

// 消防员路由
export const firefighterRoutes: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'Dashboard',
    component: () => import('@/views/firefighter/Dashboard.vue'),
    meta: {
      title: '实时监控',
      roles: [UserRole.FIREFIGHTER]
    }
  },
  {
    path: 'events/single',
    name: 'SingleEvents',
    component: () => import('@/views/firefighter/SingleEvents.vue'),
    meta: {
      title: '零星事件',
      roles: [UserRole.FIREFIGHTER]
    }
  },
  {
    path: 'events/related',
    name: 'RelatedEvents',
    component: () => import('@/views/firefighter/RelatedEvents.vue'),
    meta: {
      title: '同诉事件',
      roles: [UserRole.FIREFIGHTER]
    }
  },
  {
    path: 'analytics',
    name: 'Analytics',
    component: () => import('@/views/firefighter/Analytics.vue'),
    meta: {
      title: '数据分析',
      roles: [UserRole.FIREFIGHTER]
    }
  }
]

// 根据角色获取可用路由
export function getRoutesByRole(role: UserRole): RouteRecordRaw[] {
  switch (role) {
    case UserRole.CITIZEN:
      return citizenRoutes
    case UserRole.FIREFIGHTER:
      return firefighterRoutes
    default:
      return []
  }
}

// 根据角色获取默认重定向路径
export function getDefaultRedirectByRole(role: UserRole): string {
  switch (role) {
    case UserRole.CITIZEN:
      return '/main/report'
    case UserRole.FIREFIGHTER:
      return '/main/dashboard'
    default:
      return '/main'
  }
} 