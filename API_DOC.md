# 数智伴宠 - API接口文档

## 基础信息

- **Base URL**: `https://api.petcare.com/api/v1`
- **认证方式**: Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 参数错误 |
| 401 | 认证失败 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

## 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1234567890
}
```

## 接口列表

### 1. 用户认证模块

#### 1.1 用户注册
- **接口**: `POST /user/register`
- **说明**: 新用户注册

**请求参数**:
```json
{
  "username": "用户名",
  "password": "密码（可选）",
  "petList": [
    {
      "petName": "宠物名",
      "type": "种类",
      "breed": "品种",
      "gender": "性别",
      "birthday": "生日",
      "personality": "性格",
      "hobby": "喜好"
    }
  ]
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userInfo": {
      "id": "用户ID",
      "username": "用户名",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "access_token",
    "petList": []
  },
  "timestamp": 1234567890
}
```

#### 1.2 用户登录
- **接口**: `POST /user/login`
- **说明**: 用户登录

**请求参数**:
```json
{
  "username": "用户名",
  "password": "密码（可选，支持第三方登录）"
}
```

#### 1.3 获取用户信息
- **接口**: `GET /user/info`
- **说明**: 获取当前登录用户信息

**请求头**:
```
Authorization: Bearer {token}
```

#### 1.4 用户登出
- **接口**: `POST /user/logout`
- **说明**: 退出登录

### 2. 宠物管理模块

#### 2.1 获取宠物列表
- **接口**: `GET /pet`
- **说明**: 获取当前用户的所有宠物

**响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "宠物ID",
      "userId": "用户ID",
      "petName": "宠物名",
      "type": "种类",
      "breed": "品种",
      "gender": "性别",
      "birthday": "生日",
      "personality": "性格",
      "hobby": "喜好",
      "avatar": "头像URL",
      "createdAt": "创建时间",
      "updatedAt": "更新时间"
    }
  ],
  "timestamp": 1234567890
}
```

#### 2.2 添加宠物
- **接口**: `POST /pet`
- **说明**: 添加新宠物

**请求参数**:
```json
{
  "petName": "宠物名",
  "type": "种类",
  "breed": "品种",
  "gender": "性别",
  "birthday": "生日",
  "personality": "性格",
  "hobby": "喜好"
}
```

#### 2.3 更新宠物信息
- **接口**: `PUT /pet/{petId}`
- **说明**: 更新宠物信息

#### 2.4 删除宠物
- **接口**: `DELETE /pet/{petId}`
- **说明**: 删除宠物

### 3. 养宠日志模块

#### 3.1 获取日志列表
- **接口**: `GET /log`
- **说明**: 获取养宠日志列表

**查询参数**:
- `petId`: 宠物ID（可选）

**响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "日志ID",
      "userId": "用户ID",
      "petId": "宠物ID",
      "content": "日志内容",
      "tags": ["日常", "健康"],
      "publishTo": ["petLog", "community"],
      "images": ["图片URL"],
      "createTime": "创建时间",
      "healthInfo": {
        "stool": "正常",
        "appetite": "正常",
        "spirit": "正常"
      }
    }
  ],
  "timestamp": 1234567890
}
```

#### 3.2 创建日志
- **接口**: `POST /log`
- **说明**: 创建新的养宠日志

**请求参数**:
```json
{
  "petId": "宠物ID",
  "content": "日志内容",
  "tags": ["日常", "健康"],
  "publishTo": ["petLog"],
  "healthInfo": {
    "stool": "正常",
    "appetite": "正常",
    "spirit": "正常"
  }
}
```

#### 3.3 删除日志
- **接口**: `DELETE /log/{logId}`
- **说明**: 删除日志

### 4. AI分析模块

#### 4.1 生成AI分析报告
- **接口**: `POST /ai/report`
- **说明**: 基于宠物日志生成AI健康分析报告

**请求参数**:
```json
{
  "petId": "宠物ID"
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "生成成功",
  "data": {
    "id": "报告ID",
    "petId": "宠物ID",
    "petName": "宠物名",
    "riskLevel": "low",
    "possibleDiseases": ["肠胃炎"],
    "tips": ["当前宠物状态良好"],
    "recommendProducts": ["益生菌"],
    "recommendDoctors": ["张医生"],
    "recommendHospitals": ["XX医院"],
    "createdAt": "创建时间"
  },
  "timestamp": 1234567890
}
```

### 5. 社区模块

#### 5.1 获取帖子列表
- **接口**: `GET /community/posts`
- **说明**: 获取社区帖子列表

**查询参数**:
- `tag`: 标签（可选）
- `page`: 页码（可选）
- `pageSize`: 每页数量（可选）

**响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "帖子ID",
      "userId": "用户ID",
      "username": "用户名",
      "userAvatar": "头像URL",
      "content": "帖子内容",
      "tags": ["日常记录"],
      "images": ["图片URL"],
      "createTime": "创建时间",
      "likeCount": 10,
      "commentCount": 5,
      "collectCount": 3
    }
  ],
  "timestamp": 1234567890
}
```

#### 5.2 创建帖子
- **接口**: `POST /community/posts`
- **说明**: 创建新的社区帖子

**请求参数**:
```json
{
  "content": "帖子内容",
  "tags": ["日常记录", "医疗知识"]
}
```

#### 5.3 点赞帖子
- **接口**: `POST /community/posts/{postId}/like`
- **说明**: 点赞或取消点赞帖子

#### 5.4 收藏帖子
- **接口**: `POST /community/posts/{postId}/favorite`
- **说明**: 收藏或取消收藏帖子

### 6. 商品模块（预留）

#### 6.1 获取商品列表
- **接口**: `GET /products`
- **说明**: 获取商品列表

#### 6.2 商品详情
- **接口**: `GET /products/{productId}`
- **说明**: 获取商品详情

### 7. 专家模块（预留）

#### 7.1 获取专家列表
- **接口**: `GET /experts`
- **说明**: 获取专家列表

#### 7.2 预约专家
- **接口**: `POST /appointments`
- **说明**: 创建预约

**请求参数**:
```json
{
  "petId": "宠物ID",
  "expertId": "专家ID",
  "type": "服务类型",
  "appointmentTime": "预约时间",
  "note": "备注"
}
```

## 数据库表结构

### 1. 用户表 (user)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | VARCHAR(64) | 用户ID，主键 |
| username | VARCHAR(100) | 用户名 |
| avatar | VARCHAR(255) | 头像URL |
| phone | VARCHAR(20) | 手机号 |
| email | VARCHAR(100) | 邮箱 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 2. 宠物表 (pet)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | VARCHAR(64) | 宠物ID，主键 |
| user_id | VARCHAR(64) | 用户ID，外键 |
| pet_name | VARCHAR(100) | 宠物名 |
| type | VARCHAR(50) | 种类 |
| breed | VARCHAR(100) | 品种 |
| gender | VARCHAR(20) | 性别 |
| birthday | DATE | 生日 |
| personality | JSON | 性格 |
| hobby | JSON | 喜好 |
| avatar | VARCHAR(255) | 宠物头像 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 3. 日志表 (pet_log)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | VARCHAR(64) | 日志ID，主键 |
| user_id | VARCHAR(64) | 用户ID |
| pet_id | VARCHAR(64) | 宠物ID |
| content | TEXT | 日志内容 |
| tags | JSON | 标签 |
| publish_to | JSON | 发布位置 |
| images | JSON | 图片URL列表 |
| create_time | TIMESTAMP | 创建时间 |
| health_info | JSON | 健康信息 |

### 4. AI分析表 (ai_report)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | VARCHAR(64) | 报告ID，主键 |
| pet_id | VARCHAR(64) | 宠物ID |
| pet_name | VARCHAR(100) | 宠物名 |
| risk_level | VARCHAR(20) | 风险等级 |
| possible_diseases | JSON | 可能疾病 |
| tips | JSON | 健康建议 |
| recommend_products | JSON | 推荐商品 |
| recommend_doctors | JSON | 推荐专家 |
| recommend_hospitals | JSON | 推荐医院 |
| created_at | TIMESTAMP | 创建时间 |

### 5. 社区帖子表 (community_post)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | VARCHAR(64) | 帖子ID，主键 |
| user_id | VARCHAR(64) | 用户ID |
| username | VARCHAR(100) | 用户名 |
| user_avatar | VARCHAR(255) | 用户头像 |
| content | TEXT | 帖子内容 |
| tags | JSON | 标签 |
| images | JSON | 图片URL列表 |
| create_time | TIMESTAMP | 创建时间 |
| like_count | INT | 点赞数 |
| comment_count | INT | 评论数 |
| collect_count | INT | 收藏数 |

### 6. 商品表 (product)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | VARCHAR(64) | 商品ID，主键 |
| name | VARCHAR(200) | 商品名称 |
| description | TEXT | 商品描述 |
| price | DECIMAL(10,2) | 价格 |
| stock | INT | 库存 |
| images | JSON | 图片URL列表 |
| category | VARCHAR(50) | 分类 |
| tags | JSON | 标签 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 7. 专家表 (expert)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | VARCHAR(64) | 专家ID，主键 |
| name | VARCHAR(100) | 专家姓名 |
| avatar | VARCHAR(255) | 头像URL |
| specialty | JSON | 擅长领域 |
| experience | INT | 从业年限 |
| description | TEXT | 简介 |
| hospital_id | VARCHAR(64) | 所属医院ID |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 8. 预约表 (appointment)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | VARCHAR(64) | 预约ID，主键 |
| user_id | VARCHAR(64) | 用户ID |
| pet_id | VARCHAR(64) | 宠物ID |
| expert_id | VARCHAR(64) | 专家ID |
| type | VARCHAR(50) | 服务类型 |
| appointment_time | TIMESTAMP | 预约时间 |
| status | VARCHAR(20) | 状态 |
| note | TEXT | 备注 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## 注意事项

1. 所有接口需要在请求头中携带 `Authorization: Bearer {token}`
2. Token有效期为7天，过期后需要重新登录
3. 所有时间字段使用ISO 8601格式
4. 多对多关系使用JSON数组存储
5. 图片等资源采用URL列表形式
6. AI分析报告仅供参考，不能替代专业医疗诊断
