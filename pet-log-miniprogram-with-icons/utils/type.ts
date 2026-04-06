// 用户信息类型
export interface UserInfo {
  username: string;
  id: string;
}

// 宠物信息类型
export interface PetInfo {
  id: string;
  petName: string;
  type: string;
  breed: string;
  gender: string;
  birthday: string;
  personality?: string;
  hobby?: string;
}

// 日志类型
export interface PetLog {
  id: string;
  userId: string;
  petId: string;
  content: string;
  tags: string[];
  publishTo: string[];
  createTime: string;
  healthInfo?: {
    stool?: string;
    appetite?: string;
    spirit?: string;
  };
}

// AI分析报告类型
export interface AiReport {
  petId: string;
  petName: string;
  riskLevel: 'low' | 'medium' | 'high';
  possibleDiseases: string[];
  tips: string[];
  recommendProducts?: string[];
  recommendDoctors?: string[];
  recommendHospitals?: string[];
}

// 社区帖子类型
export interface CommunityPost {
  id: string;
  userId: string;
  username: string;
  content: string;
  tags: string[];
  createTime: string;
  likeCount: number;
  commentCount: number;
  collectCount: number;
}