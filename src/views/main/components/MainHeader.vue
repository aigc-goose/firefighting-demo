<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, ArrowDown } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store'
import { UserRole } from '@/data/mock'

const router = useRouter()
const authStore = useAuthStore()

// 计算其他已登录的角色
const otherRoles = computed(() => {
  return authStore.getLoggedRoles().filter(role => role !== authStore.userRole)
})

// 切换角色
const switchRole = (role: UserRole) => {
  const success = authStore.switchRole(role)
  if (success) {
    ElMessage.success(`已切换到${role === UserRole.CITIZEN ? '普通用户' : '消防员'}`)
    // 重新加载页面以更新界面
    window.location.reload()
  } else {
    ElMessage.error('角色切换失败')
  }
}

// 退出登录处理
const handleLogout = async (command: string) => {
  try {
    if (command === 'current') {
      // 退出当前角色
      const roleName = authStore.isFirefighter ? '消防员' : '普通用户'
      await ElMessageBox.confirm(
        `确认退出当前${roleName}登录吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      
      const currentRole = authStore.userRole
      if (currentRole) {
        authStore.clearRoleAuth(currentRole)
        
        // 如果还有其他角色登录，则重定向到主页，否则回到登录页
        const remainingRoles = authStore.getLoggedRoles()
        if (remainingRoles.length > 0) {
          window.location.reload()
        } else {
          router.push('/login')
        }
        
        ElMessage.success('退出成功')
      }
    } else if (command === 'all') {
      // 退出全部登录
      await ElMessageBox.confirm(
        '确认退出全部角色登录吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      
      // 清除所有角色的登录状态
      const allRoles = authStore.getLoggedRoles()
      allRoles.forEach(role => {
        authStore.clearRoleAuth(role)
      })
      
      router.push('/login')
      ElMessage.success('已退出全部登录')
    }
  } catch (error) {
    // 用户取消操作
    console.log('用户取消退出操作')
  }
}
</script>

<template>
  <div class="main-header">
    <div class="header-left">
      <h1 class="system-title">智慧城市事件上报系统</h1>
      <el-tag 
        :type="authStore.isFirefighter ? 'danger' : 'primary'" 
        size="small"
        class="role-tag"
      >
        {{ authStore.isFirefighter ? '消防员' : '普通用户' }}
      </el-tag>
    </div>
    
    <div class="header-right">
      <!-- 用户信息 -->
      <div class="user-info">
        <el-icon class="user-icon">
          <User />
        </el-icon>
        <span class="user-name">{{ authStore.userName }}</span>
      </div>
      
      <!-- 角色切换按钮 -->
      <el-dropdown v-if="otherRoles.length > 0" @command="switchRole">
        <el-button type="text" class="switch-btn">
          角色切换
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item 
              v-for="role in otherRoles" 
              :key="role"
              :command="role"
            >
              {{ role === UserRole.CITIZEN ? '普通用户' : '消防员' }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <!-- 退出登录 -->
      <el-dropdown @command="handleLogout">
        <el-button type="text" class="logout-btn">
          退出
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="current">
              退出当前角色
            </el-dropdown-item>
            <el-dropdown-item command="all" divided>
              退出全部登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 100%;
  background: #fff;
  border-bottom: 1px solid #e5e6eb;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.system-title {
  margin: 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
}

.role-tag {
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.user-icon {
  color: #6b7280;
  font-size: 16px;
}

.user-name {
  color: #374151;
  font-weight: 500;
  font-size: 14px;
}

.switch-btn,
.logout-btn {
  color: #6b7280;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
}

.switch-btn:hover,
.logout-btn:hover {
  color: #3b82f6;
  background: #f3f4f6;
}

.logout-btn:hover {
  color: #dc2626;
}
</style>
