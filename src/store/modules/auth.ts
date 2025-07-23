import { defineStore } from 'pinia'
import { User, LoginForm } from '@/types'
import { UserRole, mockUsers } from '@/data/mock'
import { LocalCache } from '@/utils/cache'

// 不同角色的token键名
const TOKEN_KEYS = {
  [UserRole.CITIZEN]: 'citizen_token',
  [UserRole.FIREFIGHTER]: 'firefighter_token'
}

interface AuthState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isLoggedIn: false
  }),

  getters: {
    userRole: (state) => state.user?.role,
    isCitizen: (state) => state.user?.role === UserRole.CITIZEN,
    isFirefighter: (state) => state.user?.role === UserRole.FIREFIGHTER,
    userName: (state) => state.user?.name,
    userPhone: (state) => state.user?.phone
  },

  actions: {
    // 登录
    async login(loginForm: LoginForm): Promise<{ success: boolean; message: string }> {
      try {
        // 模拟登录验证
        const user = mockUsers.find(
          u => u.username === loginForm.username && 
               u.password === loginForm.password && 
               u.role === loginForm.role
        )

        if (!user) {
          return { success: false, message: '用户名、密码或角色选择错误' }
        }

        // 生成模拟token
        const token = `${user.role}_${user.id}_${Date.now()}`
        const tokenKey = TOKEN_KEYS[user.role]

        // 保存用户信息和token
        this.user = user
        this.token = token
        this.isLoggedIn = true

        // 持久化存储
        LocalCache.setItem(tokenKey, token)
        LocalCache.setItem(`${tokenKey}_user`, user)

        return { success: true, message: '登录成功' }
      } catch (error) {
        console.error('登录失败:', error)
        return { success: false, message: '登录失败，请重试' }
      }
    },

    // 退出登录
    logout() {
      if (this.user?.role) {
        const tokenKey = TOKEN_KEYS[this.user.role]
        LocalCache.removeItem(tokenKey)
        LocalCache.removeItem(`${tokenKey}_user`)
      }
      
      this.user = null
      this.token = null
      this.isLoggedIn = false
    },

    // 检查登录状态
    checkAuth() {
      // 检查所有角色的token
      for (const role of Object.values(UserRole)) {
        const tokenKey = TOKEN_KEYS[role]
        const token = LocalCache.getItem(tokenKey)
        const user = LocalCache.getItem(`${tokenKey}_user`)

        if (token && user) {
          this.user = user
          this.token = token
          this.isLoggedIn = true
          return true
        }
      }
      return false
    },

    // 切换角色（支持同一浏览器多角色登录）
    switchRole(role: UserRole) {
      const tokenKey = TOKEN_KEYS[role]
      const token = LocalCache.getItem(tokenKey)
      const user = LocalCache.getItem(`${tokenKey}_user`)

      if (token && user && user.role === role) {
        this.user = user
        this.token = token
        this.isLoggedIn = true
        return true
      }
      return false
    },

    // 获取已登录的角色列表
    getLoggedRoles(): UserRole[] {
      const loggedRoles: UserRole[] = []
      
      for (const role of Object.values(UserRole)) {
        const tokenKey = TOKEN_KEYS[role]
        const token = LocalCache.getItem(tokenKey)
        if (token) {
          loggedRoles.push(role)
        }
      }
      
      return loggedRoles
    },

    // 清除特定角色的登录状态
    clearRoleAuth(role: UserRole) {
      const tokenKey = TOKEN_KEYS[role]
      LocalCache.removeItem(tokenKey)
      LocalCache.removeItem(`${tokenKey}_user`)

      // 如果清除的是当前角色，则切换到其他已登录角色或完全退出
      if (this.user?.role === role) {
        const otherRoles = this.getLoggedRoles().filter(r => r !== role)
        if (otherRoles.length > 0) {
          this.switchRole(otherRoles[0])
        } else {
          this.logout()
        }
      }
    }
  }
}) 