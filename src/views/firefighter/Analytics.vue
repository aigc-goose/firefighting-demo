<template>
  <div class="analytics">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card v-for="stat in statsCards" :key="stat.key" class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <el-card class="chart-card">
        <template #header>
          <h3>事件类型分布</h3>
        </template>
        <div class="chart-container">
          <div class="chart-placeholder">
            <el-icon><PieChart /></el-icon>
            <p>饼图展示各类型事件占比</p>
          </div>
        </div>
      </el-card>

      <el-card class="chart-card">
        <template #header>
          <h3>区域事件分布</h3>
        </template>
        <div class="chart-container">
          <div class="chart-placeholder">
            <el-icon><BarChart /></el-icon>
            <p>柱状图展示各区域事件数量</p>
          </div>
        </div>
      </el-card>

      <el-card class="chart-card">
        <template #header>
          <h3>24小时事件趋势</h3>
        </template>
        <div class="chart-container">
          <div class="chart-placeholder">
            <el-icon><LineChart /></el-icon>
            <p>折线图展示24小时事件趋势</p>
          </div>
        </div>
      </el-card>

      <el-card class="chart-card">
        <template #header>
          <h3>事件热力图</h3>
        </template>
        <div class="chart-container">
          <div class="chart-placeholder">
            <el-icon><Location /></el-icon>
            <p>地图热力图显示事件密度分布</p>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed } from 'vue'
import { PieChart, BarChart, LineChart, Location } from '@element-plus/icons-vue'
import { mockStatistics } from '@/data/mock'

const statsCards = computed(() => [
  { key: 'today', label: '今日事件', value: mockStatistics.todayEvents },
  { key: 'processing', label: '处理中', value: mockStatistics.processingEvents },
  { key: 'resolved', label: '已解决', value: mockStatistics.resolvedEvents },
  { key: 'avgResponse', label: '平均响应时间', value: `${mockStatistics.averageResponseTime}分钟` },
  { key: 'avgProcessing', label: '平均处理时间', value: `${mockStatistics.averageProcessingTime}分钟` }
])
</script>

<style scoped>
.analytics {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 8px;
}

.stat-label {
  color: #6b7280;
  font-size: 14px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #9ca3af;
}

.chart-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
</style> 