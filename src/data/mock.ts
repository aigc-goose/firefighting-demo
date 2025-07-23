// 事件分类枚举
export enum EventType {
  FIRE = 'fire', // 突发火灾
  FLOOD = 'flood', // 突发洪灾
  LANDSLIDE = 'landslide', // 突发泥石流
  TRAFFIC_ACCIDENT = 'traffic_accident', // 交通事故
  BUILDING_COLLAPSE = 'building_collapse', // 建筑倒塌
  GAS_LEAK = 'gas_leak', // 燃气泄漏
  OTHER = 'other' // 其他
}

// 事件状态
export enum EventStatus {
  PENDING = 'pending', // 待处理
  PROCESSING = 'processing', // 处理中
  RESOLVED = 'resolved', // 已解决
  CLOSED = 'closed' // 已关闭
}

// 用户角色
export enum UserRole {
  CITIZEN = 'citizen', // 普通用户
  FIREFIGHTER = 'firefighter' // 消防员
}

// 区域枚举
export enum District {
  HANYANG = 'hanyang', // 汉阳
  WUCHANG = 'wuchang', // 武昌
  HANKOU = 'hankou' // 汉口
}

// 事件类型标签映射
export const EVENT_TYPE_LABELS = {
  [EventType.FIRE]: '突发火灾',
  [EventType.FLOOD]: '突发洪灾', 
  [EventType.LANDSLIDE]: '突发泥石流',
  [EventType.TRAFFIC_ACCIDENT]: '交通事故',
  [EventType.BUILDING_COLLAPSE]: '建筑倒塌',
  [EventType.GAS_LEAK]: '燃气泄漏',
  [EventType.OTHER]: '其他'
}

// 区域标签映射
export const DISTRICT_LABELS = {
  [District.HANYANG]: '汉阳',
  [District.WUCHANG]: '武昌',
  [District.HANKOU]: '汉口'
}

// 模拟用户数据
export const mockUsers = [
  {
    id: 1,
    username: 'user001',
    password: '123456',
    role: UserRole.CITIZEN,
    name: '张三',
    phone: '13812345678'
  },
  {
    id: 2,
    username: 'firefighter001',
    password: '123456',
    role: UserRole.FIREFIGHTER,
    name: '李消防',
    phone: '13987654321',
    department: '武汉市消防支队'
  }
]

// 模拟事件数据
export const mockEvents = [
  {
    id: 1,
    type: EventType.FIRE,
    title: '居民楼突发火灾',
    description: '某小区3号楼发生火灾，现场有浓烟',
    location: {
      address: '武汉市汉阳区某某小区3号楼',
      longitude: 114.2734,
      latitude: 30.5583,
      district: District.HANYANG
    },
    reporterId: 1,
    reporterName: '张三',
    reporterPhone: '13812345678',
    status: EventStatus.PROCESSING,
    severity: 'high', // 严重程度
    reportTime: '2024-01-15 14:30:00',
    updateTime: '2024-01-15 15:00:00',
    responseTime: 30, // 响应时间(分钟)
    processingTime: null, // 处理时间(分钟)
    media: [
      {
        type: 'image',
        url: '/images/fire1.jpg',
        thumbnail: '/images/fire1_thumb.jpg'
      }
    ],
    relatedEventIds: [2, 3], // 同诉事件ID
    aiAnalysis: {
      severityAnalysis: '根据上报描述和图片分析，此次火灾事件严重程度较高，建议立即派遣消防队伍处理。',
      suggestion: '1. 立即疏散周边居民\n2. 派遣3辆消防车到场\n3. 联系供水部门确保水压充足'
    }
  },
  {
    id: 2,
    type: EventType.FIRE,
    title: '同地点火情上报',
    description: '3号楼确实着火了，火势很大',
    location: {
      address: '武汉市汉阳区某某小区3号楼',
      longitude: 114.2734,
      latitude: 30.5583,
      district: District.HANYANG
    },
    reporterId: 1,
    reporterName: '王五',
    reporterPhone: '13698765432',
    status: EventStatus.PROCESSING,
    severity: 'high',
    reportTime: '2024-01-15 14:35:00',
    updateTime: '2024-01-15 15:00:00',
    responseTime: 25,
    processingTime: null,
    media: [
      {
        type: 'video',
        url: '/videos/fire1.mp4',
        thumbnail: '/videos/fire1_thumb.jpg'
      }
    ],
    relatedEventIds: [1, 3]
  },
  {
    id: 3,
    type: EventType.FIRE,
    title: '小区火灾现场',
    description: '现场确认3号楼2单元发生火灾',
    location: {
      address: '武汉市汉阳区某某小区3号楼',
      longitude: 114.2734,
      latitude: 30.5583,
      district: District.HANYANG
    },
    reporterId: 1,
    reporterName: '赵六',
    reporterPhone: '13787654321',
    status: EventStatus.PROCESSING,
    severity: 'high',
    reportTime: '2024-01-15 14:40:00',
    updateTime: '2024-01-15 15:00:00',
    responseTime: 20,
    processingTime: null,
    media: [],
    relatedEventIds: [1, 2]
  },
  {
    id: 4,
    type: EventType.TRAFFIC_ACCIDENT,
    title: '交通事故',
    description: '两车相撞，有人员受伤',
    location: {
      address: '武汉市武昌区珞喻路与民族大道交叉口',
      longitude: 114.3579,
      latitude: 30.5255,
      district: District.WUCHANG
    },
    reporterId: 1,
    reporterName: '刘七',
    reporterPhone: '13876543210',
    status: EventStatus.RESOLVED,
    severity: 'medium',
    reportTime: '2024-01-15 10:20:00',
    updateTime: '2024-01-15 12:30:00',
    responseTime: 15,
    processingTime: 130,
    media: [
      {
        type: 'image',
        url: '/images/accident1.jpg',
        thumbnail: '/images/accident1_thumb.jpg'
      }
    ],
    relatedEventIds: []
  },
  {
    id: 5,
    type: EventType.GAS_LEAK,
    title: '燃气泄漏',
    description: '闻到浓烈的燃气味',
    location: {
      address: '武汉市汉口区解放大道某餐厅',
      longitude: 114.2853,
      latitude: 30.5994,
      district: District.HANKOU
    },
    reporterId: 1,
    reporterName: '陈八',
    reporterPhone: '13765432109',
    status: EventStatus.PENDING,
    severity: 'high',
    reportTime: '2024-01-15 16:10:00',
    updateTime: '2024-01-15 16:10:00',
    responseTime: null,
    processingTime: null,
    media: [],
    relatedEventIds: []
  }
]

// 模拟统计数据
export const mockStatistics = {
  todayEvents: 15,
  processingEvents: 8,
  resolvedEvents: 7,
  averageResponseTime: 18, // 分钟
  averageProcessingTime: 85, // 分钟
  eventsByType: {
    [EventType.FIRE]: 5,
    [EventType.FLOOD]: 2,
    [EventType.LANDSLIDE]: 1,
    [EventType.TRAFFIC_ACCIDENT]: 4,
    [EventType.BUILDING_COLLAPSE]: 0,
    [EventType.GAS_LEAK]: 2,
    [EventType.OTHER]: 1
  },
  eventsByDistrict: {
    [District.HANYANG]: 6,
    [District.WUCHANG]: 5,
    [District.HANKOU]: 4
  },
  hourlyEvents: [
    { hour: 0, count: 0 },
    { hour: 1, count: 0 },
    { hour: 2, count: 1 },
    { hour: 3, count: 0 },
    { hour: 4, count: 0 },
    { hour: 5, count: 0 },
    { hour: 6, count: 1 },
    { hour: 7, count: 2 },
    { hour: 8, count: 3 },
    { hour: 9, count: 2 },
    { hour: 10, count: 1 },
    { hour: 11, count: 1 },
    { hour: 12, count: 0 },
    { hour: 13, count: 1 },
    { hour: 14, count: 2 },
    { hour: 15, count: 0 },
    { hour: 16, count: 1 },
    { hour: 17, count: 0 },
    { hour: 18, count: 0 },
    { hour: 19, count: 0 },
    { hour: 20, count: 0 },
    { hour: 21, count: 0 },
    { hour: 22, count: 0 },
    { hour: 23, count: 0 }
  ]
} 