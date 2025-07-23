<script setup lang="ts">
import MainHeader from './components/MainHeader.vue'
import MainNavigation from './components/MainNavigation.vue'
</script>

<template>
  <el-container>
    <el-header class="main-header-container">
      <MainHeader />
    </el-header>
    <el-header class="main-nav-container">
      <MainNavigation />
    </el-header>
    <el-main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
  </el-container>
</template>

<style scoped>
.main-header-container {
  height: 64px;
  padding: 0;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.main-nav-container {
  height: 50px;
  padding: 0;
  background: #fff;
}

.main-content {
  background: #f5f6fa;
  padding: 24px;
  min-height: calc(100vh - 114px);
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
