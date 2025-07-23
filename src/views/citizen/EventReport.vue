<template>
  <div class="event-report">
    <el-card class="report-card">
      <template #header>
        <div class="card-header">
          <h2>事件上报</h2>
          <p>请详细描述您遇到的突发事件，我们会尽快处理</p>
        </div>
      </template>

      <el-form
        ref="reportFormRef"
        :model="reportForm"
        :rules="reportRules"
        label-width="100px"
        class="report-form"
        @submit.prevent="handleSubmit"
      >
        <!-- 事件分类 -->
        <el-form-item label="事件分类" prop="type" required>
          <el-select
            v-model="reportForm.type"
            placeholder="请选择事件类型"
            class="full-width"
            size="large"
          >
            <el-option
              v-for="(label, value) in EVENT_TYPE_LABELS"
              :key="value"
              :label="label"
              :value="value"
            >
              <div class="option-item">
                <span class="option-label">{{ label }}</span>
                <el-icon class="option-icon">
                  <Warning v-if="value === EventType.FIRE" />
                  <Cloudy v-else-if="value === EventType.FLOOD" />
                  <MapLocation v-else-if="value === EventType.LANDSLIDE" />
                  <Promotion v-else-if="value === EventType.TRAFFIC_ACCIDENT" />
                  <House v-else-if="value === EventType.BUILDING_COLLAPSE" />
                  <Discount v-else-if="value === EventType.GAS_LEAK" />
                  <More v-else />
                </el-icon>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 事件位置 -->
        <el-form-item label="事件位置" prop="location.address" required>
          <div class="location-input">
            <el-input
              v-model="reportForm.location.address"
              placeholder="请输入详细地址"
              size="large"
              class="address-input"
            />
            <el-button
              type="primary"
              size="large"
              :loading="locating"
              @click="getCurrentLocation"
            >
              <el-icon><Location /></el-icon>
              {{ locating ? '定位中...' : '获取位置' }}
            </el-button>
          </div>
          <div v-if="reportForm.location.longitude && reportForm.location.latitude" class="location-info">
            <el-tag size="small" type="success">
              已定位：{{ reportForm.location.longitude?.toFixed(6) }}, {{ reportForm.location.latitude?.toFixed(6) }}
            </el-tag>
          </div>
        </el-form-item>

        <!-- 联系方式 -->
        <el-form-item label="联系电话" prop="reporterPhone" required>
          <el-input
            v-model="reportForm.reporterPhone"
            placeholder="请输入您的手机号码"
            size="large"
            maxlength="11"
            show-word-limit
          />
        </el-form-item>

        <!-- 事件描述 -->
        <el-form-item label="事件描述" prop="description">
          <el-input
            v-model="reportForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述事件情况、发生时间、涉及人员等信息"
            maxlength="500"
            show-word-limit
          />
          <div class="voice-input">
            <el-button
              type="text"
              size="small"
              :loading="recording"
              @click="toggleRecording"
            >
              <el-icon><Microphone /></el-icon>
              {{ recording ? '停止录音' : '语音输入' }}
            </el-button>
          </div>
        </el-form-item>

        <!-- 多媒体上传 -->
        <el-form-item label="上传文件">
          <div class="media-upload">
            <el-upload
              ref="uploadRef"
              v-model:file-list="fileList"
              :auto-upload="false"
              :show-file-list="false"
              multiple
              accept="image/*,video/*,audio/*"
              @change="handleFileChange"
            >
              <el-button type="primary" plain>
                <el-icon><Plus /></el-icon>
                选择文件
              </el-button>
            </el-upload>
            
            <!-- 文件预览 -->
            <div v-if="fileList.length > 0" class="file-preview">
              <div
                v-for="(file, index) in fileList"
                :key="index"
                class="file-item"
              >
                <div class="file-info">
                  <el-icon class="file-icon">
                    <Picture v-if="file.raw?.type.startsWith('image/')" />
                    <VideoCamera v-else-if="file.raw?.type.startsWith('video/')" />
                    <Headset v-else />
                  </el-icon>
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size || 0) }}</span>
                </div>
                <el-button
                  type="danger"
                  text
                  size="small"
                  @click="removeFile(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <div class="submit-actions">
            <el-button size="large" @click="resetForm">重置</el-button>
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="handleSubmit"
            >
              {{ submitting ? '提交中...' : '提交上报' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import {
  Warning,
  Cloudy,
  MapLocation,
  Promotion,
  House,
  Discount,
  More,
  Location,
  Microphone,
  Plus,
  Picture,
  VideoCamera,
  Headset,
  Delete
} from '@element-plus/icons-vue'
import type { UploadFiles } from 'element-plus'
import { EventType, EVENT_TYPE_LABELS } from '@/data/mock'
import { useAuthStore } from '@/store'
import type { EventReportForm } from '@/types'

const authStore = useAuthStore()

// 响应式数据
const reportFormRef = ref<InstanceType<typeof ElForm>>()
const uploadRef = ref()
const fileList = ref<UploadFiles>([])
const submitting = ref(false)
const locating = ref(false)
const recording = ref(false)

// 表单数据
const reportForm = reactive<EventReportForm>({
  type: EventType.FIRE,
  description: '',
  location: {
    address: '',
    longitude: undefined,
    latitude: undefined
  },
  reporterPhone: authStore.userPhone || '',
  media: [],
  voiceText: ''
})

// 表单验证规则
const reportRules = {
  type: [
    { required: true, message: '请选择事件类型', trigger: 'change' }
  ],
  'location.address': [
    { required: true, message: '请输入事件地址', trigger: 'blur' },
    { min: 5, message: '请输入详细地址', trigger: 'blur' }
  ],
  reporterPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  description: [
    { min: 10, message: '请详细描述事件情况（至少10个字符）', trigger: 'blur' }
  ]
}

// 获取当前位置
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    ElMessage.error('您的浏览器不支持地理位置获取')
    return
  }

  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      reportForm.location.longitude = position.coords.longitude
      reportForm.location.latitude = position.coords.latitude
      
      // 这里可以调用高德地图API进行逆地理编码，获取地址信息
      // 为了演示，这里只是简单的设置经纬度
      ElMessage.success('位置获取成功')
      locating.value = false
    },
    (error) => {
      console.error('获取位置失败:', error)
      ElMessage.error('位置获取失败，请手动输入地址')
      locating.value = false
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  )
}

// 切换录音状态
const toggleRecording = () => {
  if (recording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// 开始录音
const startRecording = () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    ElMessage.error('您的浏览器不支持录音功能')
    return
  }

  recording.value = true
  // 这里可以集成语音识别API
  // 为了演示，我们只是简单的模拟
  setTimeout(() => {
    recording.value = false
    ElMessage.info('语音录制功能正在开发中')
  }, 2000)
}

// 停止录音
const stopRecording = () => {
  recording.value = false
  // 实际项目中在这里处理语音转文字
}

// 文件上传处理
const handleFileChange = (uploadFiles: UploadFiles) => {
  // 验证文件大小和类型
  const maxSize = 10 * 1024 * 1024 // 10MB
  const validFiles = uploadFiles.filter(file => {
    if (file.size && file.size > maxSize) {
      ElMessage.error(`文件 ${file.name} 大小超过 10MB`)
      return false
    }
    return true
  })
  
  fileList.value = validFiles
  reportForm.media = validFiles.map(file => file.raw).filter(Boolean) as File[]
}

// 移除文件
const removeFile = (index: number) => {
  fileList.value.splice(index, 1)
  reportForm.media.splice(index, 1)
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 重置表单
const resetForm = () => {
  reportFormRef.value?.resetFields()
  fileList.value = []
  reportForm.media = []
  reportForm.location = {
    address: '',
    longitude: undefined,
    latitude: undefined
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!reportFormRef.value) return

  try {
    const valid = await reportFormRef.value.validate()
    if (!valid) return

    submitting.value = true

    // 模拟提交API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    ElMessage.success('事件上报成功，我们会尽快处理')
    resetForm()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.event-report {
  max-width: 800px;
  margin: 0 auto;
}

.report-card {
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

.report-form {
  margin-top: 20px;
}

.full-width {
  width: 100%;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.option-icon {
  color: #6b7280;
}

.location-input {
  display: flex;
  gap: 12px;
}

.address-input {
  flex: 1;
}

.location-info {
  margin-top: 8px;
}

.voice-input {
  margin-top: 8px;
}

.media-upload {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.file-icon {
  color: #6b7280;
  font-size: 16px;
}

.file-name {
  color: #374151;
  font-weight: 500;
  flex: 1;
}

.file-size {
  color: #9ca3af;
  font-size: 12px;
}

.submit-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}
</style> 