<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon today">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ statistics.todayEvents }}</h3>
            <p>今日事件</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon processing">
            <el-icon><Loading /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ statistics.processingEvents }}</h3>
            <p>处理中</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon resolved">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ statistics.resolvedEvents }}</h3>
            <p>已解决</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon response">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ statistics.averageResponseTime }}分钟</h3>
            <p>平均响应时间</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 实时事件流 -->
    <el-card class="realtime-card">
      <template #header>
        <div class="card-header">
          <h3>
            <el-icon><Bell /></el-icon>
            实时事件流
          </h3>
          <div class="header-actions">
            <el-tag :type="isAutoRefresh ? 'success' : 'info'" size="small">
              {{ isAutoRefresh ? '自动刷新中' : '已暂停' }}
            </el-tag>
            <el-button size="small" @click="toggleAutoRefresh">
              {{ isAutoRefresh ? '暂停' : '开始' }}
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="realtime-content">
        <div class="event-stream" ref="eventStreamRef">
          <transition-group name="event-item" tag="div">
            <div
              v-for="event in realtimeEvents"
              :key="event.id"
              class="event-item"
              :class="getEventClass(event)"
              @click="showEventDetail(event)"
            >
              <div class="event-indicator">
                <div class="event-dot" :class="getSeverityClass(event.severity)"></div>
              </div>
              <div class="event-content">
                <div class="event-header">
                  <el-tag :type="getEventTypeColor(event.type)" size="small">
                    {{ EVENT_TYPE_LABELS[event.type] }}
                  </el-tag>
                  <span class="event-time">{{ formatTime(event.reportTime) }}</span>
                </div>
                <h4 class="event-title">{{ event.title }}</h4>
                <p class="event-description">{{ event.description }}</p>
                <div class="event-location">
                  <el-icon><Location /></el-icon>
                  {{ event.location.address }}
                </div>
                <div class="event-reporter">
                  <el-icon><Phone /></el-icon>
                  {{ event.reporterName }} - {{ event.reporterPhone }}
                </div>
              </div>
              <div class="event-actions">
                <el-tag :type="getStatusColor(event.status)" size="small">
                  {{ getStatusText(event.status) }}
                </el-tag>
                <el-button 
                  v-if="event.status === EventStatus.PENDING"
                  type="primary" 
                  size="small"
                  @click.stop="handleEvent(event)"
                >
                  处理
                </el-button>
              </div>
            </div>
          </transition-group>
        </div>
        
        <!-- 无数据提示 -->
        <el-empty 
          v-if="realtimeEvents.length === 0 && !loading"
          description="暂无实时事件"
          :image-size="100"
        />
        
        <!-- 加载中 -->
        <div v-if="loading" class="loading-wrapper">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
      </div>
    </el-card>

    <!-- 事件详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="`事件详情 #${selectedEvent?.id}`"
      width="50%"
    >
      <div v-if="selectedEvent" class="event-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="事件类型">
            <el-tag :type="getEventTypeColor(selectedEvent.type)">
              {{ EVENT_TYPE_LABELS[selectedEvent.type] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="严重程度">
            <el-tag :type="getSeverityColor(selectedEvent.severity)">
              {{ getSeverityText(selectedEvent.severity) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="上报时间">
            {{ selectedEvent.reportTime }}
          </el-descriptions-item>
          <el-descriptions-item label="上报人">
            {{ selectedEvent.reporterName }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ selectedEvent.reporterPhone }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusColor(selectedEvent.status)">
              {{ getStatusText(selectedEvent.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="事件位置" :span="2">
            {{ selectedEvent.location.address }}
          </el-descriptions-item>
          <el-descriptions-item label="事件描述" :span="2">
            {{ selectedEvent.description }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <div class="dialog-actions">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button 
            v-if="selectedEvent?.status === EventStatus.PENDING"
            type="primary"
            @click="handleEvent(selectedEvent)"
          >
            处理事件
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Calendar,
  Loading,
  Check,
  Timer,
  Bell,
  Location,
  Phone
} from '@element-plus/icons-vue'
import { EventType, EventStatus, EVENT_TYPE_LABELS, mockEvents, mockStatistics } from '@/data/mock'
import type { Statistics } from '@/types'

// 响应式数据
const loading = ref(false)
const detailVisible = ref(false)
const selectedEvent = ref<Event | null>(null)
const isAutoRefresh = ref(true)
const realtimeEvents = ref<Event[]>([])
const statistics = reactive<Statistics>(mockStatistics)
const eventStreamRef = ref<HTMLElement>()

let refreshTimer: number | null = null

// 获取事件类型颜色
const getEventTypeColor = (type: EventType) => {
  const colorMap = {
    [EventType.FIRE]: 'danger',
    [EventType.FLOOD]: 'primary',
    [EventType.LANDSLIDE]: 'warning',
    [EventType.TRAFFIC_ACCIDENT]: 'info',
    [EventType.BUILDING_COLLAPSE]: 'danger',
    [EventType.GAS_LEAK]: 'warning',
    [EventType.OTHER]: ''
  }
  return colorMap[type] || ''
}

// 获取状态颜色
const getStatusColor = (status: EventStatus) => {
  const colorMap = {
    [EventStatus.PENDING]: 'warning',
    [EventStatus.PROCESSING]: 'primary',
    [EventStatus.RESOLVED]: 'success',
    [EventStatus.CLOSED]: 'info'
  }
  return colorMap[status] || ''
}

// 获取状态文本
const getStatusText = (status: EventStatus) => {
  const textMap = {
    [EventStatus.PENDING]: '待处理',
    [EventStatus.PROCESSING]: '处理中',
    [EventStatus.RESOLVED]: '已解决',
    [EventStatus.CLOSED]: '已关闭'
  }
  return textMap[status] || status
}

// 获取严重程度样式类
const getSeverityClass = (severity: string) => {
  return `severity-${severity}`
}

// 获取严重程度颜色
const getSeverityColor = (severity: string) => {
  const colorMap = {
    low: 'success',
    medium: 'warning',
    high: 'danger'
  }
  return colorMap[severity] || ''
}

// 获取严重程度文本
const getSeverityText = (severity: string) => {
  const textMap = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return textMap[severity] || severity
}

// 获取事件样式类
const getEventClass = (event: Event) => {
  return {
    'event-urgent': event.severity === 'high',
    'event-new': isNewEvent(event)
  }
}

// 判断是否为新事件（5分钟内）
const isNewEvent = (event: Event) => {
  const now = new Date()
  const reportTime = new Date(event.reportTime)
  return (now.getTime() - reportTime.getTime()) < 5 * 60 * 1000
}

// 格式化时间
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

// 切换自动刷新
const toggleAutoRefresh = () => {
  isAutoRefresh.value = !isAutoRefresh.value
  if (isAutoRefresh.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

// 开始自动刷新
const startAutoRefresh = () => {
  if (refreshTimer) return
  
  refreshTimer = window.setInterval(() => {
    loadRealtimeEvents()
  }, 10000) // 每10秒刷新一次
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 加载实时事件
const loadRealtimeEvents = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 获取最新的10条事件，按时间倒序排列
    const sortedEvents = [...mockEvents]
      .sort((a, b) => new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime())
      .slice(0, 10)
    
    realtimeEvents.value = sortedEvents
    
    // 滚动到顶部（显示最新事件）
    nextTick(() => {
      if (eventStreamRef.value) {
        eventStreamRef.value.scrollTop = 0
      }
    })
    
  } catch (error) {
    console.error('加载实时事件失败:', error)
    ElMessage.error('加载实时事件失败')
  }
}

// 显示事件详情
const showEventDetail = (event: Event) => {
  selectedEvent.value = event
  detailVisible.value = true
}

// 处理事件
const handleEvent = async (event: Event) => {
  try {
    // 模拟处理事件的API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新事件状态
    event.status = EventStatus.PROCESSING
    ElMessage.success('事件已开始处理')
    
    // 关闭详情对话框
    if (detailVisible.value) {
      detailVisible.value = false
    }
    
    // 刷新数据
    loadRealtimeEvents()
    
  } catch (error) {
    console.error('处理事件失败:', error)
    ElMessage.error('处理事件失败')
  }
}

// 页面挂载
onMounted(() => {
  loadRealtimeEvents()
  if (isAutoRefresh.value) {
    startAutoRefresh()
  }
})

// 页面卸载
onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.today { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.processing { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.resolved { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-icon.response { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); color: #333; }

.stat-info h3 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.stat-info p {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 14px;
}

.realtime-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.realtime-content {
  min-height: 400px;
  position: relative;
}

.event-stream {
  max-height: 600px;
  overflow-y: auto;
  padding: 8px 0;
}

.event-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.event-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.event-item.event-urgent {
  border-left: 4px solid #ef4444;
}

.event-item.event-new {
  background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%);
}

.event-indicator {
  flex-shrink: 0;
  padding-top: 4px;
}

.event-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.event-dot.severity-low { background: #10b981; }
.event-dot.severity-medium { background: #f59e0b; }
.event-dot.severity-high { background: #ef4444; }

.event-content {
  flex: 1;
}

.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.event-time {
  color: #6b7280;
  font-size: 12px;
}

.event-title {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

.event-description {
  margin: 0 0 12px 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-location,
.event-reporter {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 4px;
}

.event-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: #6b7280;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.event-item-enter-active,
.event-item-leave-active {
  transition: all 0.5s ease;
}

.event-item-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.event-item-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style> 