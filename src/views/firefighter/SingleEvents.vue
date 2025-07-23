<template>
  <div class="single-events">
    <el-card class="events-card">
      <template #header>
        <div class="card-header">
          <h2>零星事件列表</h2>
          <p>查看和管理独立发生的突发事件</p>
        </div>
      </template>

      <!-- 查询工具栏 -->
      <div class="query-toolbar">
        <el-form :model="queryForm" inline class="query-form">
          <el-form-item label="事件分类">
            <el-select v-model="queryForm.type" placeholder="全部分类" clearable>
              <el-option
                v-for="(label, value) in EVENT_TYPE_LABELS"
                :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="区域">
            <el-select v-model="queryForm.district" placeholder="全部区域" clearable>
              <el-option
                v-for="(label, value) in DISTRICT_LABELS"
                :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryForm.status" placeholder="全部状态" clearable>
              <el-option label="待处理" :value="EventStatus.PENDING" />
              <el-option label="处理中" :value="EventStatus.PROCESSING" />
              <el-option label="已解决" :value="EventStatus.RESOLVED" />
              <el-option label="已关闭" :value="EventStatus.CLOSED" />
            </el-select>
          </el-form-item>
          <el-form-item label="严重程度">
            <el-select v-model="queryForm.severity" placeholder="全部程度" clearable>
              <el-option label="低" value="low" />
              <el-option label="中" value="medium" />
              <el-option label="高" value="high" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadEvents">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 事件列表 -->
      <div class="events-list">
        <el-table
          v-loading="loading"
          :data="eventList"
          stripe
          row-key="id"
          @row-click="showEventDetail"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="编号" width="80" />
          <el-table-column label="事件信息" min-width="300">
            <template #default="{ row }">
              <div class="event-info">
                <div class="event-header">
                  <el-tag :type="getEventTypeColor(row.type)" size="small">
                    {{ EVENT_TYPE_LABELS[row.type] }}
                  </el-tag>
                  <el-tag :type="getSeverityColor(row.severity)" size="small">
                    {{ getSeverityText(row.severity) }}
                  </el-tag>
                </div>
                <h4 class="event-title">{{ row.title }}</h4>
                <p class="event-desc">{{ row.description }}</p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="位置信息" min-width="200">
            <template #default="{ row }">
              <div class="location-info">
                <div class="district">
                  <el-tag type="info" size="small">{{ DISTRICT_LABELS[row.location.district] }}</el-tag>
                </div>
                <div class="address">{{ row.location.address }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="上报信息" min-width="150">
            <template #default="{ row }">
              <div class="reporter-info">
                <div class="reporter-name">{{ row.reporterName }}</div>
                <div class="reporter-phone">{{ row.reporterPhone }}</div>
                <div class="report-time">{{ formatDateTime(row.reportTime) }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusColor(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="响应时间" width="100">
            <template #default="{ row }">
              <span v-if="row.responseTime" class="response-time">
                {{ row.responseTime }}分钟
              </span>
              <span v-else class="no-response">-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="text" size="small" @click.stop="showEventDetail(row)">
                  详情
                </el-button>
                <el-button 
                  v-if="row.status === EventStatus.PENDING"
                  type="primary" 
                  size="small"
                  @click.stop="handleEvent(row)"
                >
                  处理
                </el-button>
                <el-button 
                  v-if="row.status === EventStatus.PROCESSING"
                  type="success" 
                  size="small"
                  @click.stop="completeEvent(row)"
                >
                  完成
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadEvents"
            @current-change="loadEvents"
          />
        </div>
      </div>
    </el-card>

    <!-- 事件详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="`事件详情 #${selectedEvent?.id}`"
      width="70%"
      :before-close="closeDetail"
    >
      <div v-if="selectedEvent" class="event-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3>基本信息</h3>
          <el-descriptions :column="3" border>
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
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusColor(selectedEvent.status)">
                {{ getStatusText(selectedEvent.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="上报时间">
              {{ selectedEvent.reportTime }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ selectedEvent.updateTime }}
            </el-descriptions-item>
            <el-descriptions-item label="响应时间">
              {{ selectedEvent.responseTime ? `${selectedEvent.responseTime}分钟` : '未响应' }}
            </el-descriptions-item>
            <el-descriptions-item label="上报人">
              {{ selectedEvent.reporterName }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ selectedEvent.reporterPhone }}
            </el-descriptions-item>
            <el-descriptions-item label="区域">
              {{ DISTRICT_LABELS[selectedEvent.location.district] }}
            </el-descriptions-item>
            <el-descriptions-item label="详细地址" :span="3">
              {{ selectedEvent.location.address }}
            </el-descriptions-item>
            <el-descriptions-item label="事件描述" :span="3">
              {{ selectedEvent.description }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 媒体文件 -->
        <div v-if="selectedEvent.media.length > 0" class="detail-section">
          <h3>媒体文件</h3>
          <div class="media-grid">
            <div
              v-for="(media, index) in selectedEvent.media"
              :key="index"
              class="media-item"
            >
              <el-image
                v-if="media.type === 'image'"
                :src="media.url"
                :preview-src-list="getImageList(selectedEvent.media)"
                fit="cover"
                class="media-preview"
              />
              <div v-else class="media-placeholder">
                <el-icon class="media-icon">
                  <VideoCamera v-if="media.type === 'video'" />
                  <Headset v-else />
                </el-icon>
                <span class="media-type">{{ media.type === 'video' ? '视频' : '音频' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 地图位置 -->
        <div class="detail-section">
          <h3>位置信息</h3>
          <div class="location-map">
            <p>经纬度：{{ selectedEvent.location.longitude }}, {{ selectedEvent.location.latitude }}</p>
            <div class="map-placeholder">
              <el-icon><Location /></el-icon>
              <span>地图显示功能开发中</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-actions">
          <el-button @click="closeDetail">关闭</el-button>
          <el-button 
            v-if="selectedEvent?.status === EventStatus.PENDING"
            type="primary"
            @click="handleEvent(selectedEvent)"
          >
            开始处理
          </el-button>
          <el-button 
            v-if="selectedEvent?.status === EventStatus.PROCESSING"
            type="success"
            @click="completeEvent(selectedEvent)"
          >
            标记完成
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, VideoCamera, Headset, Location } from '@element-plus/icons-vue'
import { 
  EventType, 
  EventStatus, 
  District, 
  EVENT_TYPE_LABELS, 
  DISTRICT_LABELS, 
  mockEvents 
} from '@/data/mock'
import type { Event } from '@/types'

// 响应式数据
const loading = ref(false)
const detailVisible = ref(false)
const selectedEvent = ref<Event | null>(null)
const eventList = ref<Event[]>([])

// 查询表单
const queryForm = reactive({
  type: undefined as EventType | undefined,
  district: undefined as District | undefined,
  status: undefined as EventStatus | undefined,
  severity: undefined as string | undefined
})

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 工具函数
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

const getSeverityColor = (severity: string) => {
  const colorMap = {
    low: 'success',
    medium: 'warning',
    high: 'danger'
  }
  return colorMap[severity] || ''
}

const getSeverityText = (severity: string) => {
  const textMap = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return textMap[severity] || severity
}

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const getImageList = (mediaList: any[]) => {
  return mediaList
    .filter(media => media.type === 'image')
    .map(media => media.url)
}

// 加载事件列表
const loadEvents = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 过滤零星事件（没有关联事件的）
    let filteredEvents = mockEvents.filter(event => event.relatedEventIds.length === 0)
    
    // 应用筛选条件
    if (queryForm.type) {
      filteredEvents = filteredEvents.filter(event => event.type === queryForm.type)
    }
    if (queryForm.district) {
      filteredEvents = filteredEvents.filter(event => event.location.district === queryForm.district)
    }
    if (queryForm.status) {
      filteredEvents = filteredEvents.filter(event => event.status === queryForm.status)
    }
    if (queryForm.severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === queryForm.severity)
    }
    
    // 分页
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    
    eventList.value = filteredEvents.slice(start, end)
    pagination.total = filteredEvents.length
    
  } catch (error) {
    console.error('加载事件失败:', error)
    ElMessage.error('加载事件失败')
  } finally {
    loading.value = false
  }
}

// 重置查询
const resetQuery = () => {
  queryForm.type = undefined
  queryForm.district = undefined
  queryForm.status = undefined
  queryForm.severity = undefined
  pagination.page = 1
  loadEvents()
}

// 显示事件详情
const showEventDetail = (event: Event) => {
  selectedEvent.value = event
  detailVisible.value = true
}

// 关闭详情
const closeDetail = () => {
  detailVisible.value = false
  selectedEvent.value = null
}

// 处理事件
const handleEvent = async (event: Event) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    event.status = EventStatus.PROCESSING
    event.responseTime = Math.floor(Math.random() * 30) + 5 // 5-35分钟随机响应时间
    event.updateTime = new Date().toLocaleString('zh-CN')
    
    ElMessage.success('事件已开始处理')
    
    if (detailVisible.value) {
      detailVisible.value = false
    }
    
  } catch (error) {
    console.error('处理事件失败:', error)
    ElMessage.error('处理事件失败')
  }
}

// 完成事件
const completeEvent = async (event: Event) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    event.status = EventStatus.RESOLVED
    event.processingTime = Math.floor(Math.random() * 120) + 30 // 30-150分钟随机处理时间
    event.updateTime = new Date().toLocaleString('zh-CN')
    
    ElMessage.success('事件已标记为完成')
    
    if (detailVisible.value) {
      detailVisible.value = false
    }
    
  } catch (error) {
    console.error('完成事件失败:', error)
    ElMessage.error('完成事件失败')
  }
}

// 页面挂载
onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
.single-events {
  max-width: 1400px;
  margin: 0 auto;
}

.events-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header h2 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 24px;
  font-weight: 600;
}

.card-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.query-toolbar {
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.events-list {
  margin-top: 20px;
}

.event-info .event-header {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.event-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.event-desc {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.location-info .district {
  margin-bottom: 4px;
}

.location-info .address {
  font-size: 12px;
  color: #6b7280;
}

.reporter-info {
  font-size: 12px;
  line-height: 1.5;
}

.reporter-name {
  font-weight: 500;
  color: #1f2937;
}

.reporter-phone,
.report-time {
  color: #6b7280;
}

.response-time {
  color: #059669;
  font-weight: 500;
}

.no-response {
  color: #6b7280;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.event-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.media-item {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.media-preview {
  width: 100%;
  height: 100%;
}

.media-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #6b7280;
}

.media-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.media-type {
  font-size: 12px;
}

.location-map {
  text-align: center;
}

.map-placeholder {
  height: 200px;
  background: #f8f9fa;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  margin-top: 12px;
}

.map-placeholder .el-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style> 