// ============ 数据库表结构类型定义 ============

// 用户表 (user)
export interface UserInfo {
  id: string;           // 用户ID，主键
  username: string;     // 用户名
  avatar?: string;      // 头像URL
  avatarUrl?: string;   // 头像URL（兼容字段）
  phone?: string;       // 手机号
  email?: string;       // 邮箱
  wechatId?: string;    // 微信号
  gender?: string;      // 性别
  region?: string;      // 地区
  signature?: string;   // 个性签名
  birthday?: string;    // 生日
  createdAt: string;    // 创建时间
  updatedAt: string;    // 更新时间
}

// 宠物表 (pet)
export interface PetInfo {
  id: string;           // 宠物ID，主键
  userId: string;       // 用户ID，外键关联user表
  petName: string;      // 宠物名
  type: string;         // 种类（猫/狗/其他）
  breed: string;        // 品种
  gender: string;       // 性别
  birthday: string;     // 生日
  personality?: string; // 性格（JSON格式存储）
  hobby?: string;       // 喜好（JSON格式存储）
  avatar?: string;      // 宠物头像URL
  createdAt: string;   // 创建时间
  updatedAt: string;   // 更新时间
}

// 养宠日志表 (pet_log)
export interface PetLog {
  id: string;           // 日志ID，主键
  userId: string;       // 用户ID
  petId: string;        // 宠物ID，外键关联pet表
  content: string;      // 日志内容
  tags: string[];       // 标签（JSON数组存储）
  publishTo: string[];  // 发布位置（petLog/community，JSON数组）
  images?: string[];    // 图片URL列表（JSON数组）
  createTime: string;   // 创建时间
  healthInfo?: {        // 健康信息（JSON格式）
    stool?: string;     // 粪便情况
    appetite?: string;  // 食欲情况
    spirit?: string;    // 精神状态
  };
}

// AI分析报告表 (ai_report)
export interface AiReport {
  id: string;                    // 报告ID，主键
  petId: string;                 // 宠物ID，外键关联pet表
  petName: string;               // 宠物名（冗余字段，便于查询）
  riskLevel: 'low' | 'medium' | 'high';  // 风险等级
  possibleDiseases: string[];    // 可能疾病（JSON数组）
  tips: string[];               // 健康建议（JSON数组）
  recommendProducts?: string[];  // 推荐商品（JSON数组）
  recommendDoctors?: string[];   // 推荐专家（JSON数组）
  recommendHospitals?: string[]; // 推荐医院（JSON数组）
  createdAt: string;             // 创建时间
}

// 社区帖子表 (community_post)
export interface CommunityPost {
  id: string;           // 帖子ID，主键
  userId: string;       // 用户ID，外键关联user表
  username: string;     // 用户名（冗余字段）
  userAvatar?: string;  // 用户头像
  content: string;      // 帖子内容
  tags: string[];       // 标签（JSON数组）
  images?: string[];    // 图片URL列表（JSON数组）
  createTime: string;   // 创建时间
  likeCount: number;    // 点赞数
  commentCount: number; // 评论数
  collectCount: number; // 收藏数
}

// 社区评论表 (community_comment)
export interface CommunityComment {
  id: string;           // 评论ID，主键
  postId: string;       // 帖子ID，外键关联community_post表
  userId: string;       // 用户ID
  username: string;     // 用户名
  content: string;      // 评论内容
  createTime: string;   // 创建时间
}

// 社区点赞表 (community_like)
export interface CommunityLike {
  id: string;       // 点赞ID，主键
  postId: string;   // 帖子ID
  userId: string;   // 用户ID
  createTime: string; // 创建时间
}

// 社区收藏表 (community_favorite)
export interface CommunityFavorite {
  id: string;       // 收藏ID，主键
  postId: string;   // 帖子ID
  userId: string;   // 用户ID
  createTime: string; // 创建时间
}

// 商品表 (product)
export interface Product {
  id: string;           // 商品ID，主键
  name: string;         // 商品名称
  description: string;  // 商品描述
  price: number;        // 价格
  stock: number;        // 库存
  images: string[];     // 图片URL列表（JSON数组）
  category: string;     // 分类
  tags: string[];       // 标签（JSON数组）
  createdAt: string;    // 创建时间
  updatedAt: string;    // 更新时间
}

// 专家表 (expert)
export interface Expert {
  id: string;           // 专家ID，主键
  name: string;         // 专家姓名
  avatar?: string;      // 头像URL
  specialty: string[];  // 擅长领域（JSON数组）
  experience: number;   // 从业年限
  description: string;  // 简介
  hospitalId?: string;  // 所属医院ID
  createdAt: string;    // 创建时间
  updatedAt: string;    // 更新时间
}

// 预约表 (appointment)
export interface Appointment {
  id: string;           // 预约ID，主键
  userId: string;       // 用户ID
  petId: string;        // 宠物ID
  expertId: string;     // 专家ID
  type: string;         // 服务类型
  appointmentTime: string; // 预约时间
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'; // 状态
  note?: string;        // 备注
  createdAt: string;    // 创建时间
  updatedAt: string;    // 更新时间
}

// ============ 前端兼容类型 ============
// 为了兼容旧代码，保留简化版的类型定义
export interface SimpleUserInfo {
  username: string;
  id: string;
}
