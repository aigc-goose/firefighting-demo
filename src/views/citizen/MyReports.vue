<template>
  <div class="my-reports">
    <el-card class="reports-card">
      <template #header>
        <div class="card-header">
          <h2>我的上报</h2>
          <p>查看您的事件上报历史和处理状态</p>
        </div>
      </template>

      <!-- 筛选工具栏 -->
      <div class="filter-toolbar">
        <el-form :model="filterForm" inline>
          <el-form-item label="事件类型">
            <el-select v-model="filterForm.type" placeholder="全部类型" clearable>
              <el-option
                v-for="(label, value) in EVENT_TYPE_LABELS"
                :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="processing" />
              <el-option label="已解决" value="resolved" />
              <el-option label="已关闭" value="closed" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadReports">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 报告列表 -->
      <div class="reports-list">
        <el-table
          v-loading="loading"
          :data="reportList"
          stripe
          @row-click="showDetail"
        >
          <el-table-column prop="id" label="编号" width="80" />
          <el-table-column prop="title" label="事件标题" min-width="200">
            <template #default="{ row }">
              <div class="event-title">
                <el-tag :type="getEventTypeColor(row.type)" size="small">
                  {{ EVENT_TYPE_LABELS[row.type] }}
                </el-tag>
                <span class="title-text">{{ row.title }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="location.address" label="位置" min-width="180" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusColor(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reportTime" label="上报时间" width="180" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button type="text" size="small" @click.stop="showDetail(row)">
                查看详情
              </el-button>
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
            @size-change="loadReports"
            @current-change="loadReports"
          />
        </div>
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="`事件详情 #${selectedReport?.id}`"
      width="60%"
      :before-close="closeDetail"
    >
      <div v-if="selectedReport" class="event-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3>基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="事件类型">
              <el-tag :type="getEventTypeColor(selectedReport.type)">
                {{ EVENT_TYPE_LABELS[selectedReport.type] }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusColor(selectedReport.status)">
                {{ getStatusText(selectedReport.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="上报时间">
              {{ selectedReport.reportTime }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ selectedReport.updateTime }}
            </el-descriptions-item>
            <el-descriptions-item label="事件位置" :span="2">
              {{ selectedReport.location.address }}
            </el-descriptions-item>
            <el-descriptions-item label="事件描述" :span="2">
              {{ selectedReport.description }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 处理进度 -->
        <div v-if="selectedReport.responseTime || selectedReport.processingTime" class="detail-section">
          <h3>处理进度</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item v-if="selectedReport.responseTime" label="响应时间">
              {{ selectedReport.responseTime }}分钟
            </el-descriptions-item>
            <el-descriptions-item v-if="selectedReport.processingTime" label="处理时间">
              {{ selectedReport.processingTime }}分钟
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 媒体文件 -->
        <div v-if="selectedReport.media.length > 0" class="detail-section">
          <h3>上传文件</h3>
          <div class="media-grid">
            <div
              v-for="(media, index) in selectedReport.media"
              :key="index"
              class="media-item"
            >
              <el-image
                v-if="media.type === 'image'"
                :src="media.url"
                :preview-src-list="getImageList(selectedReport.media)"
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
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoCamera, Headset } from '@element-plus/icons-vue'
import { EventType, EventStatus, EVENT_TYPE_LABELS, mockEvents } from '@/data/mock'
import { useAuthStore } from '@/store'
import type { Event } from '@/types'

const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const detailVisible = ref(false)
const selectedReport = ref<Event | null>(null)
const reportList = ref<Event[]>([])

// 筛选表单
const filterForm = reactive({
  type: undefined as EventType | undefined,
  status: undefined as EventStatus | undefined
})

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

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

// 获取图片列表（用于预览）
const getImageList = (mediaList: any[]) => {
  return mediaList
    .filter(media => media.type === 'image')
    .map(media => media.url)
}

// 加载报告列表
const loadReports = async () => {
  loading.value = true
  try {
    // 模拟API调用，实际项目中这里会调用真实的API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 筛选用户的报告（根据当前登录用户）
    let filteredReports = mockEvents.filter(event => event.reporterId === authStore.user?.id)
    
    // 应用筛选条件
    if (filterForm.type) {
      filteredReports = filteredReports.filter(event => event.type === filterForm.type)
    }
    if (filterForm.status) {
      filteredReports = filteredReports.filter(event => event.status === filterForm.status)
    }
    
    // 分页
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    
    reportList.value = filteredReports.slice(start, end)
    pagination.total = filteredReports.length
    
  } catch (error) {
    console.error('加载报告失败:', error)
    ElMessage.error('加载报告失败')
  } finally {
    loading.value = false
  }
}

// 重置筛选
const resetFilter = () => {
  filterForm.type = undefined
  filterForm.status = undefined
  pagination.page = 1
  loadReports()
}

// 显示详情
const showDetail = (report: Event) => {
  selectedReport.value = report
  detailVisible.value = true
}

// 关闭详情
const closeDetail = () => {
  detailVisible.value = false
  selectedReport.value = null
}

// 页面挂载时加载数据
onMounted(() => {
  loadReports()
})
</script>

<style scoped>
.my-reports {
  max-width: 1200px;
  margin: 0 auto;
}

.reports-card {
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

.filter-toolbar {
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.reports-list {
  margin-top: 20px;
}

.event-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  font-weight: 500;
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
</style> 