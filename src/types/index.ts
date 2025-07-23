import { EventType, EventStatus, UserRole, District } from '@/data/mock'

// 用户类型
export interface User {
  id: number
  username: string
  password: string
  role: UserRole
  name: string
  phone: string
  department?: string // 消防员部门
}

// 位置信息类型
export interface Location {
  address: string
  longitude: number
  latitude: number
  district: District
}

// 媒体文件类型
export interface MediaFile {
  type: 'image' | 'video' | 'audio'
  url: string
  thumbnail?: string
}

// AI分析结果类型
export interface AIAnalysis {
  severityAnalysis: string
  suggestion: string
}

// 事件类型
export interface Event {
  id: number
  type: EventType
  title: string
  description: string
  location: Location
  reporterId: number
  reporterName: string
  reporterPhone: string
  status: EventStatus
  severity: 'low' | 'medium' | 'high'
  reportTime: string
  updateTime: string
  responseTime?: number // 响应时间(分钟)
  processingTime?: number // 处理时间(分钟)
  media: MediaFile[]
  relatedEventIds: number[] // 同诉事件ID
  aiAnalysis?: AIAnalysis
}

// 事件上报表单类型
export interface EventReportForm {
  type: EventType
  description: string
  location: {
    address: string
    longitude?: number
    latitude?: number
    district?: District
  }
  reporterPhone: string
  media: File[]
  voiceText?: string // 语音转文字
}

// 登录表单类型
export interface LoginForm {
  username: string
  password: string
  role: UserRole
}

// 统计数据类型
export interface Statistics {
  todayEvents: number
  processingEvents: number
  resolvedEvents: number
  averageResponseTime: number
  averageProcessingTime: number
  eventsByType: Record<EventType, number>
  eventsByDistrict: Record<District, number>
  hourlyEvents: Array<{ hour: number; count: number }>
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页参数类型
export interface PageParams {
  page: number
  pageSize: number
  type?: EventType
  district?: District
  status?: EventStatus
}

// 分页响应类型
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
} 