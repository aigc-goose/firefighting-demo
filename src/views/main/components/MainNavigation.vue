<template>
  <div class="main-navigation">
    <el-menu
      :default-active="$route.path"
      mode="horizontal"
      router
      class="nav-menu"
    >
      <!-- 普通用户菜单 -->
      <template v-if="authStore.isCitizen">
        <el-menu-item index="/main/report">
          <el-icon><EditPen /></el-icon>
          <span>事件上报</span>
        </el-menu-item>
        <el-menu-item index="/main/my-reports">
          <el-icon><Document /></el-icon>
          <span>我的上报</span>
        </el-menu-item>
      </template>

      <!-- 消防员菜单 -->
      <template v-if="authStore.isFirefighter">
        <el-menu-item index="/main/dashboard">
          <el-icon><Monitor /></el-icon>
          <span>实时监控</span>
        </el-menu-item>
        <el-menu-item index="/main/events/single">
          <el-icon><List /></el-icon>
          <span>零星事件</span>
        </el-menu-item>
        <el-menu-item index="/main/events/related">
          <el-icon><Link /></el-icon>
          <span>同诉事件</span>
        </el-menu-item>
        <el-menu-item index="/main/analytics">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { 
  EditPen, 
  Document, 
  Monitor, 
  List, 
  Link, 
  DataAnalysis 
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store'

const authStore = useAuthStore()
</script>

<style scoped>
.main-navigation {
  background: #fff;
  border-bottom: 1px solid #e5e6eb;
}

.nav-menu {
  border-bottom: none;
  padding: 0 24px;
}

.nav-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  border-bottom: 2px solid transparent;
  margin-right: 20px;
}

.nav-menu :deep(.el-menu-item:hover) {
  color: #3b82f6;
  background: #f8faff;
}

.nav-menu :deep(.el-menu-item.is-active) {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: #f8faff;
}

.nav-menu :deep(.el-menu-item .el-icon) {
  margin-right: 6px;
}
</style> 