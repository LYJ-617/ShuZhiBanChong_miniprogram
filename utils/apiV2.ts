/**
 * 标准化RESTful API接口定义
 * 符合全栈开发参考文档规范
 */

import { http } from './http';
import { PetInfo, PetLog, AiReport, CommunityPost, UserInfo } from './type';
import { API_CONFIG, ApiResponse, PaginationParams, PaginatedResponse } from './config';

// ============ 用户认证接口 ============
interface LoginRequest {
  username: string;
  password?: string; // 可选，支持第三方登录
}

interface RegisterRequest {
  username: string;
  password?: string;
  petList: PetInfo[];
}

interface LoginResponse {
  userInfo: UserInfo;
  token: string;
  petList: PetInfo[];
}

export const userApi = {
  /**
   * 用户注册
   * POST /api/v1/user/register
   */
  register(data: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    if (API_CONFIG.USE_MOCK) {
      // Mock实现
      return new Promise((resolve) => {
        const userInfo: UserInfo = {
          id: Date.now().toString(),
          username: data.username
        };
        const petList = data.petList.map(pet => ({
          ...pet,
          id: pet.id || Date.now().toString()
        }));
        wx.setStorageSync('userInfo', JSON.stringify(userInfo));
        wx.setStorageSync('petList', JSON.stringify(petList));
        resolve({
          code: 200,
          message: '注册成功',
          data: {
            userInfo,
            token: 'mock_token_' + Date.now(),
            petList
          },
          timestamp: Date.now()
        });
      });
    }
    return http.post<LoginResponse>('/user/register', data);
  },

  /**
   * 用户登录
   * POST /api/v1/user/login
   */
  login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    if (API_CONFIG.USE_MOCK) {
      const userInfo = wx.getStorageSync('userInfo');
      const petList = wx.getStorageSync('petList');
      return new Promise((resolve) => {
        resolve({
          code: 200,
          message: '登录成功',
          data: {
            userInfo: userInfo ? JSON.parse(userInfo) : null,
            token: 'mock_token_' + Date.now(),
            petList: petList ? JSON.parse(petList) : []
          },
          timestamp: Date.now()
        });
      });
    }
    return http.post<LoginResponse>('/user/login', data);
  },

  /**
   * 获取用户信息
   * GET /api/v1/user/info
   */
  getUserInfo(): Promise<ApiResponse<UserInfo>> {
    if (API_CONFIG.USE_MOCK) {
      const userInfo = wx.getStorageSync('userInfo');
      return new Promise((resolve) => {
        resolve({
          code: 200,
          message: 'success',
          data: userInfo ? JSON.parse(userInfo) : null,
          timestamp: Date.now()
        });
      });
    }
    return http.get<UserInfo>('/user/info');
  },

  /**
   * 用户登出
   * POST /api/v1/user/logout
   */
  logout(): Promise<ApiResponse<void>> {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        resolve({
          code: 200,
          message: '登出成功',
          data: null,
          timestamp: Date.now()
        });
      });
    }
    return http.post<void>('/user/logout');
  }
};

// ============ 宠物管理接口 ============
interface CreatePetRequest {
  petName: string;
  type: string;
  breed: string;
  gender: string;
  birthday: string;
  personality?: string;
  hobby?: string;
}

export const petApi = {
  /**
   * 获取宠物列表
   * GET /api/v1/pet
   */
  getPetList(): Promise<ApiResponse<PetInfo[]>> {
    if (API_CONFIG.USE_MOCK) {
      const petList = wx.getStorageSync('petList');
      return new Promise((resolve) => {
        resolve({
          code: 200,
          message: 'success',
          data: petList ? JSON.parse(petList) : [],
          timestamp: Date.now()
        });
      });
    }
    return http.get<PetInfo[]>('/pet');
  },

  /**
   * 添加宠物
   * POST /api/v1/pet
   */
  createPet(data: CreatePetRequest): Promise<ApiResponse<PetInfo>> {
    if (API_CONFIG.USE_MOCK) {
      const petList = wx.getStorageSync('petList') ? JSON.parse(wx.getStorageSync('petList')) : [];
      const newPet: PetInfo = {
        id: Date.now().toString(),
        ...data
      };
      petList.push(newPet);
      wx.setStorageSync('petList', JSON.stringify(petList));
      return new Promise((resolve) => {
        resolve({
          code: 200,
          message: '添加成功',
          data: newPet,
          timestamp: Date.now()
        });
      });
    }
    return http.post<PetInfo>('/pet', data);
  },

  /**
   * 更新宠物信息
   * PUT /api/v1/pet/:id
   */
  updatePet(petId: string, data: Partial<CreatePetRequest>): Promise<ApiResponse<PetInfo>> {
    if (API_CONFIG.USE_MOCK) {
      const petList = wx.getStorageSync('petList') ? JSON.parse(wx.getStorageSync('petList')) : [];
      const index = petList.findIndex((p: PetInfo) => p.id === petId);
      if (index !== -1) {
        petList[index] = { ...petList[index], ...data };
        wx.setStorageSync('petList', JSON.stringify(petList));
      }
      return new Promise((resolve) => {
        resolve({
          code: 200,
          message: '更新成功',
          data: petList[index] || null,
          timestamp: Date.now()
        });
      });
    }
    return http.put<PetInfo>(`/pet/${petId}`, data);
  },

  /**
   * 删除宠物
   * DELETE /api/v1/pet/:id
   */
  deletePet(petId: string): Promise<ApiResponse<void>> {
    if (API_CONFIG.USE_MOCK) {
      const petList = wx.getStorageSync('petList') ? JSON.parse(wx.getStorageSync('petList')) : [];
      const newPetList = petList.filter((p: PetInfo) => p.id !== petId);
      wx.setStorageSync('petList', JSON.stringify(newPetList));
      return new Promise((resolve) => {
        resolve({
          code: 200,
          message: '删除成功',
          data: null,
          timestamp: Date.now()
        });
      });
    }
    return http.delete<void>(`/pet/${petId}`);
  }
};

// ============ 养宠日志接口 ============
interface CreateLogRequest {
  petId: string;
  content: string;
  tags: string[];
  publishTo: string[];
  healthInfo?: {
    stool?: string;
    appetite?: string;
    spirit?: string;
  };
}

export const logApi = {
  /**
   * 获取日志列表
   * GET /api/v1/log
   */
  getLogs(petId?: string): Promise<ApiResponse<PetLog[]>> {
    if (API_CONFIG.USE_MOCK) {
      const logs = wx.getStorageSync('petLogs');
      let result = logs ? JSON.parse(logs) : [];
      if (petId) {
        result = result.filter((log: PetLog) => log.petId === petId);
      }
      return new Promise((resolve) => {
        resolve({
          code: 200,
          message: 'success',
          data: result,
          timestamp: Date.now()
        });
      });
    }
    return http.get<PetLog[]>('/log', petId ? { petId } : undefined);
  },

  /**
   * 创建日志
   * POST /api/v1/log
   */
  createLog(data: CreateLogRequest): Promise<ApiResponse<PetLog>> {
    if (API_CONFIG.USE_MOCK) {
      const logs = wx.getStorageSync('petLogs') ? JSON.parse(wx.getStorageSync('petLogs')) : [];
      const userInfo = wx.getStorageSync('userInfo') ? JSON.parse(wx.getStorageSync('userInfo')) : null;
      const newLog: PetLog = {
        id: Date.now().toString(),
        userId: userInfo?.id || '',
        createTime: new Date().toISOString(),
        ...data
      };
      logs.push(newLog);
      wx.setStorageSync('petLogs', JSON.stringify(logs));
      return new Promise((resolve) => {
        resolve({
          code: 200,
          message: '发布成功',
          data: newLog,
          timestamp: Date.now()
        });
      });
    }
    return http.post<PetLog>('/log', data);
  },

  /**
   * 删除日志
   * DELETE /api/v1/log/:id
   */
  deleteLog(logId: string): Promise<ApiResponse<void>> {
    if (API_CONFIG.USE_MOCK) {
      const logs = wx.getStorageSync('petLogs') ? JSON.parse(wx.getStorageSync('petLogs')) : [];
      const newLogs = logs.filter((log: PetLog) => log.id !== logId);
      wx.setStorageSync('petLogs', JSON.stringify(newLogs));
      return new Promise((resolve) => {
        resolve({
          code: 200,
          message: '删除成功',
          data: null,
          timestamp: Date.now()
        });
      });
    }
    return http.delete<void>(`/log/${logId}`);
  }
};

// ============ AI分析接口 ============
export const aiApi = {
  /**
   * 生成AI分析报告
   * POST /api/v1/ai/report
   */
  generateReport(petId: string): Promise<ApiResponse<AiReport>> {
    if (API_CONFIG.USE_MOCK) {
      // 复用原有的AI分析逻辑
      const logs = wx.getStorageSync('petLogs');
      const petLogs = logs ? JSON.parse(logs) : [];
      const petLogsForPet = petLogs.filter((log: PetLog) => log.petId === petId);
      const petList = wx.getStorageSync('petList');
      const petInfo = petList ? JSON.parse(petList).find((p: PetInfo) => p.id === petId) : null;

      const report: AiReport = {
        petId,
        petName: petInfo?.petName || '宠物',
        riskLevel: 'low',
        possibleDiseases: [],
        tips: ['当前宠物状态良好，继续保持哦~']
      };

      const symptoms: string[] = [];
      petLogsForPet.forEach((log: PetLog) => {
        if (log.healthInfo) {
          if (log.healthInfo.stool) symptoms.push(log.healthInfo.stool);
          if (log.healthInfo.appetite) symptoms.push(log.healthInfo.appetite);
          if (log.healthInfo.spirit) symptoms.push(log.healthInfo.spirit);
        }
        if (log.content.includes('稀便') || log.content.includes('软便')) symptoms.push('粪便稀软');
        if (log.content.includes('不吃饭') || log.content.includes('食欲差')) symptoms.push('食欲不佳');
        if (log.content.includes('没精神') || log.content.includes('萎靡')) symptoms.push('精神不振');
      });

      const symptomDiseaseMap: Record<string, string[]> = {
        '粪便稀软': ['肠胃炎', '消化不良', '寄生虫感染'],
        '粪便干结': ['便秘', '脱水'],
        '食欲不佳': ['肠胃炎', '感冒', '口腔疾病', '全身性疾病'],
        '精神不振': ['感冒', '肠胃炎', '疼痛', '全身性疾病'],
        '掉毛严重': ['皮肤病', '营养缺乏', '季节换毛']
      };

      const possibleDiseases: string[] = [];
      symptoms.forEach(symptom => {
        if (symptomDiseaseMap[symptom]) {
          symptomDiseaseMap[symptom].forEach(disease => {
            if (!possibleDiseases.includes(disease)) {
              possibleDiseases.push(disease);
            }
          });
        }
      });

      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (possibleDiseases.length >= 2) {
        riskLevel = 'medium';
      }
      if (possibleDiseases.length >= 3 || (symptoms.includes('精神不振') && symptoms.includes('食欲不佳'))) {
        riskLevel = 'high';
      }

      const tips: string[] = [];
      if (riskLevel === 'low') {
        tips.push('当前宠物状态良好，继续保持日常的护理和饮食哦~');
      } else if (riskLevel === 'medium') {
        tips.push('宠物可能存在一些健康问题，请注意观察其状态变化，调整饮食和作息');
        if (possibleDiseases.includes('肠胃炎')) {
          tips.push('建议暂时喂食易消化的食物，避免油腻和生冷食物');
        }
        if (possibleDiseases.includes('消化不良')) {
          tips.push('可以尝试喂食益生菌帮助调理肠胃');
        }
      } else if (riskLevel === 'high') {
        tips.push('宠物的健康状况需要重视，建议尽快带往宠物医院进行检查');
        tips.push('请避免自行用药，务必咨询专业兽医的建议');
      }

      const recommendProducts: string[] = [];
      const recommendDoctors: string[] = [];
      const recommendHospitals: string[] = [];
      if (riskLevel === 'medium' || riskLevel === 'high') {
        if (possibleDiseases.includes('肠胃炎') || possibleDiseases.includes('消化不良')) {
          recommendProducts.push('宠物益生菌', '肠胃调理粮');
        }
        recommendDoctors.push('张兽医（擅长内科疾病）', '李兽医（擅长肠胃疾病）');
        recommendHospitals.push('XX宠物医院（距离2km）', 'YY宠物医院（距离1.5km）');
      }

      return new Promise((resolve) => {
        resolve({
          code: 200,
          message: '生成成功',
          data: {
            ...report,
            possibleDiseases: possibleDiseases.slice(0, 4),
            riskLevel,
            tips,
            recommendProducts,
            recommendDoctors,
            recommendHospitals
          },
          timestamp: Date.now()
        });
      });
    }
    return http.post<AiReport>('/ai/report', { petId });
  }
};

// ============ 社区接口 ============
interface CreatePostRequest {
  content: string;
  tags: string[];
}

export const communityApi = {
  /**
   * 获取帖子列表
   * GET /api/v1/community/posts
   */
  getPosts(tag?: string, params?: PaginationParams): Promise<ApiResponse<CommunityPost[]>> {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        resolve({
          code: 200,
          message: 'success',
          data: [],
          timestamp: Date.now()
        });
      });
    }
    return http.get<CommunityPost[]>('/community/posts', { tag, ...params });
  },

  /**
   * 创建帖子
   * POST /api/v1/community/posts
   */
  createPost(data: CreatePostRequest): Promise<ApiResponse<CommunityPost>> {
    if (API_CONFIG.USE_MOCK) {
      const userInfo = wx.getStorageSync('userInfo') ? JSON.parse(wx.getStorageSync('userInfo')) : null;
      const newPost: CommunityPost = {
        id: Date.now().toString(),
        userId: userInfo?.id || '',
        username: userInfo?.username || '',
        createTime: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
        collectCount: 0,
        ...data
      };
      return new Promise((resolve) => {
        resolve({
          code: 200,
          message: '发布成功',
          data: newPost,
          timestamp: Date.now()
        });
      });
    }
    return http.post<CommunityPost>('/community/posts', data);
  },

  /**
   * 点赞帖子
   * POST /api/v1/community/posts/:id/like
   */
  likePost(postId: string): Promise<ApiResponse<void>> {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        resolve({
          code: 200,
          message: '点赞成功',
          data: null,
          timestamp: Date.now()
        });
      });
    }
    return http.post<void>(`/community/posts/${postId}/like`);
  },

  /**
   * 收藏帖子
   * POST /api/v1/community/posts/:id/favorite
   */
  favoritePost(postId: string): Promise<ApiResponse<void>> {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        resolve({
          code: 200,
          message: '收藏成功',
          data: null,
          timestamp: Date.now()
        });
      });
    }
    return http.post<void>(`/community/posts/${postId}/favorite`);
  }
};

// ============ 导出旧版API兼容 ============
export const registerUser = (userInfo: UserInfo, petList: PetInfo[]): Promise<boolean> => {
  return userApi.register({ username: userInfo.username, petList }).then(() => true);
};

export const getUserInfo = (): Promise<UserInfo | null> => {
  return userApi.getUserInfo().then(res => res.data);
};

export const getPetList = (): Promise<PetInfo[]> => {
  return petApi.getPetList().then(res => res.data);
};

export const addPetLog = (log: PetLog): Promise<boolean> => {
  return logApi.createLog(log).then(() => true);
};

export const getPetLogs = (petId?: string): Promise<PetLog[]> => {
  return logApi.getLogs(petId).then(res => res.data);
};

export const generateAiReport = (petId: string): Promise<AiReport> => {
  return aiApi.generateReport(petId).then(res => res.data);
};

export const getCommunityPosts = (tag?: string): Promise<CommunityPost[]> => {
  return communityApi.getPosts(tag).then(res => res.data);
};

export const addCommunityPost = (post: CommunityPost): Promise<boolean> => {
  return communityApi.createPost(post).then(() => true);
};
