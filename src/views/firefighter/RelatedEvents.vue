<template>
  <div class="related-events">
    <el-card>
      <template #header>
        <h2>同诉事件列表</h2>
        <p>多人针对同一事件的上报记录</p>
      </template>

      <div class="events-list">
        <div
          v-for="group in eventGroups"
          :key="group.id"
          class="event-group"
        >
          <div class="group-header">
            <div class="group-info">
              <el-tag :type="getEventTypeColor(group.type)">
                {{ EVENT_TYPE_LABELS[group.type] }}
              </el-tag>
              <h3>{{ group.title }}</h3>
              <span class="report-count">{{ group.events.length }}条上报</span>
            </div>
            <div class="group-actions">
              <el-button size="small" @click="showAIAnalysis(group)">
                AI分析
              </el-button>
              <el-button type="primary" size="small" @click="showGroupDetail(group)">
                查看详情
              </el-button>
            </div>
          </div>

          <div class="group-events">
            <div
              v-for="event in group.events"
              :key="event.id"
              class="event-item"
            >
              <div class="event-info">
                <div class="event-title">上报 #{{ event.id }}</div>
                <div class="event-reporter">{{ event.reporterName }}</div>
                <div class="event-time">{{ formatTime(event.reportTime) }}</div>
              </div>
              <div class="event-status">
                <el-tag :type="getStatusColor(event.status)" size="small">
                  {{ getStatusText(event.status) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- AI分析对话框 -->
    <el-dialog v-model="aiVisible" title="AI智能分析" width="60%">
      <div v-if="selectedGroup" class="ai-analysis">
        <div class="analysis-section">
          <h4>严重程度分析</h4>
          <p>{{ selectedGroup.aiAnalysis?.severityAnalysis }}</p>
        </div>
        <div class="analysis-section">
          <h4>处理建议</h4>
          <p>{{ selectedGroup.aiAnalysis?.suggestion }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { EventType, EventStatus, EVENT_TYPE_LABELS, mockEvents } from '@/data/mock'
import type { Event } from '@/types'

const aiVisible = ref(false)
const selectedGroup = ref<any>(null)

// 处理同诉事件分组
const eventGroups = computed(() => {
  const groups: any[] = []
  const processedEvents = new Set()

  mockEvents.forEach(event => {
    if (processedEvents.has(event.id) || event.relatedEventIds.length === 0) {
      return
    }

    // 获取同一组的所有事件
    const relatedEvents = [event, ...mockEvents.filter(e => event.relatedEventIds.includes(e.id))]
    relatedEvents.forEach(e => processedEvents.add(e.id))

    groups.push({
      id: event.id,
      type: event.type,
      title: event.title,
      location: event.location,
      events: relatedEvents,
      aiAnalysis: event.aiAnalysis
    })
  })

  return groups
})

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

const getStatusColor = (status: EventStatus) => {
  const colorMap = {
    [EventStatus.PENDING]: 'warning',
    [EventStatus.PROCESSING]: 'primary',
    [EventStatus.RESOLVED]: 'success',
    [EventStatus.CLOSED]: 'info'
  }
  return colorMap[status] || ''
}

const getStatusText = (status: EventStatus) => {
  const textMap = {
    [EventStatus.PENDING]: '待处理',
    [EventStatus.PROCESSING]: '处理中',
    [EventStatus.RESOLVED]: '已解决',
    [EventStatus.CLOSED]: '已关闭'
  }
  return textMap[status] || status
}

const formatTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleString('zh-CN')
}

const showAIAnalysis = (group: any) => {
  selectedGroup.value = group
  aiVisible.value = true
}

const showGroupDetail = (group: any) => {
  // 显示详情逻辑
  console.log('显示同诉事件详情:', group)
}
</script>

<style scoped>
.related-events {
  max-width: 1200px;
  margin: 0 auto;
}

.event-group {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.group-header {
  padding: 16px;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-info h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
}

.report-count {
  font-size: 12px;
  color: #6b7280;
}

.group-events {
  padding: 16px;
}

.event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.event-title {
  font-weight: 500;
  color: #1f2937;
}

.event-reporter,
.event-time {
  font-size: 12px;
  color: #6b7280;
}

.ai-analysis .analysis-section {
  margin-bottom: 20px;
}

.ai-analysis h4 {
  color: #1f2937;
  margin-bottom: 8px;
}

.ai-analysis p {
  line-height: 1.6;
  color: #4b5563;
}
</style> 