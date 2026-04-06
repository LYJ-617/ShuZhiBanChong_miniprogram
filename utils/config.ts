// API配置
export const API_CONFIG = {
  // 基础URL - 实际部署时替换为真实后端地址
  BASE_URL: 'https://api.petcare.com/api/v1',

  // 请求超时时间
  TIMEOUT: 10000,

  // 是否使用Mock数据（开发阶段为true，生产环境为false）
  USE_MOCK: true
};

// 状态码定义
export const HTTP_STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// 统一响应格式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
