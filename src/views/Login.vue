<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>智慧城市事件上报系统</h1>
        <p>城市突发事件多人同诉上报平台</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <!-- 角色选择 -->
        <el-form-item prop="role">
          <el-radio-group v-model="loginForm.role" class="role-selector">
            <el-radio-button :label="UserRole.CITIZEN">
              <el-icon><User /></el-icon>
              普通用户
            </el-radio-button>
            <el-radio-button :label="UserRole.FIREFIGHTER">
              <el-icon><Avatar /></el-icon>
              消防员
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            :prefix-icon="User"
            placeholder="请输入用户名"
            size="large"
          />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            :prefix-icon="Lock"
            placeholder="请输入密码"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 已登录角色提示 -->
      <div v-if="loggedRoles.length > 0" class="logged-roles">
        <p>已登录角色：</p>
        <div class="role-tags">
          <el-tag
            v-for="role in loggedRoles"
            :key="role"
            :type="role === UserRole.FIREFIGHTER ? 'danger' : 'primary'"
            class="role-tag"
            @click="switchToRole(role)"
          >
            {{ role === UserRole.CITIZEN ? '普通用户' : '消防员' }}
            <el-icon class="close-icon" @click.stop="clearRole(role)">
              <Close />
            </el-icon>
          </el-tag>
        </div>
      </div>

      <!-- 演示账号 -->
      <div class="demo-accounts">
        <p>演示账号：</p>
        <div class="account-list">
          <div class="account-item" @click="fillAccount('user001', '123456', UserRole.CITIZEN)">
            <span>普通用户：user001 / 123456</span>
          </div>
          <div class="account-item" @click="fillAccount('firefighter001', '123456', UserRole.FIREFIGHTER)">
            <span>消防员：firefighter001 / 123456</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { User, Lock, Avatar, Close } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store'
import { UserRole } from '@/data/mock'
import type { LoginForm } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const loginFormRef = ref<InstanceType<typeof ElForm>>()

const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
  role: UserRole.CITIZEN
})

// 表单验证规则
const loginRules = {
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 计算属性
const loggedRoles = computed(() => authStore.getLoggedRoles())

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loading.value = true
    const result = await authStore.login(loginForm)

    if (result.success) {
      ElMessage.success(result.message)
      await router.push('/main')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('登录错误:', error)
    ElMessage.error('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

// 快速填充账号
const fillAccount = (username: string, password: string, role: UserRole) => {
  loginForm.username = username
  loginForm.password = password
  loginForm.role = role
}

// 切换到已登录角色
const switchToRole = (role: UserRole) => {
  const success = authStore.switchRole(role)
  if (success) {
    ElMessage.success('切换角色成功')
    router.push('/main')
  } else {
    ElMessage.error('切换角色失败')
  }
}

// 清除角色登录状态
const clearRole = (role: UserRole) => {
  authStore.clearRoleAuth(role)
  ElMessage.info(`已清除${role === UserRole.CITIZEN ? '普通用户' : '消防员'}登录状态`)
}

// 页面挂载时检查登录状态
onMounted(() => {
  if (authStore.isLoggedIn) {
    router.push('/main')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-box {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #333;
  font-size: 24px;
  margin-bottom: 8px;
  font-weight: 600;
}

.login-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.login-form {
  margin-bottom: 20px;
}

.role-selector {
  width: 100%;
}

.role-selector :deep(.el-radio-button) {
  flex: 1;
}

.role-selector :deep(.el-radio-button__inner) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.login-btn {
  width: 100%;
  height: 42px;
  font-size: 16px;
  font-weight: 600;
}

.logged-roles {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.logged-roles p {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.role-tags {
  display: flex;
  gap: 8px;
}

.role-tag {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s;
}

.role-tag:hover {
  transform: translateY(-1px);
}

.close-icon {
  font-size: 12px;
  cursor: pointer;
}

.demo-accounts {
  background: #f0f9ff;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.demo-accounts p {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #1e40af;
  font-weight: 600;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.account-item {
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e5e7eb;
}

.account-item:hover {
  background: #dbeafe;
  border-color: #3b82f6;
}

.account-item span {
  font-size: 13px;
  color: #374151;
}
</style> 