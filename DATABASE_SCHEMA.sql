-- 数智伴宠 - 数据库表结构设计
-- MySQL 8.0+

-- 1. 用户表
CREATE TABLE `user` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '用户ID',
  `username` VARCHAR(100) NOT NULL COMMENT '用户名',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `phone` VARCHAR(20) COMMENT '手机号',
  `email` VARCHAR(100) COMMENT '邮箱',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_username` (`username`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 宠物表
CREATE TABLE `pet` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '宠物ID',
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `pet_name` VARCHAR(100) NOT NULL COMMENT '宠物名',
  `type` VARCHAR(50) NOT NULL COMMENT '种类（猫/狗/其他）',
  `breed` VARCHAR(100) COMMENT '品种',
  `gender` VARCHAR(20) NOT NULL COMMENT '性别',
  `birthday` DATE COMMENT '生日',
  `personality` JSON COMMENT '性格',
  `hobby` JSON COMMENT '喜好',
  `avatar` VARCHAR(255) COMMENT '宠物头像URL',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_pet_name` (`pet_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宠物表';

-- 3. 养宠日志表
CREATE TABLE `pet_log` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '日志ID',
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `pet_id` VARCHAR(64) NOT NULL COMMENT '宠物ID',
  `content` TEXT NOT NULL COMMENT '日志内容',
  `tags` JSON COMMENT '标签',
  `publish_to` JSON COMMENT '发布位置（petLog/community）',
  `images` JSON COMMENT '图片URL列表',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `health_info` JSON COMMENT '健康信息',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`pet_id`) REFERENCES `pet`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_pet_id` (`pet_id`),
  INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='养宠日志表';

-- 4. AI分析报告表
CREATE TABLE `ai_report` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '报告ID',
  `pet_id` VARCHAR(64) NOT NULL COMMENT '宠物ID',
  `pet_name` VARCHAR(100) NOT NULL COMMENT '宠物名（冗余字段）',
  `risk_level` VARCHAR(20) NOT NULL COMMENT '风险等级（low/medium/high）',
  `possible_diseases` JSON COMMENT '可能疾病',
  `tips` JSON COMMENT '健康建议',
  `recommend_products` JSON COMMENT '推荐商品',
  `recommend_doctors` JSON COMMENT '推荐专家',
  `recommend_hospitals` JSON COMMENT '推荐医院',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (`pet_id`) REFERENCES `pet`(`id`) ON DELETE CASCADE,
  INDEX `idx_pet_id` (`pet_id`),
  INDEX `idx_risk_level` (`risk_level`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI分析报告表';

-- 5. 社区帖子表
CREATE TABLE `community_post` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '帖子ID',
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `username` VARCHAR(100) NOT NULL COMMENT '用户名（冗余字段）',
  `user_avatar` VARCHAR(255) COMMENT '用户头像',
  `content` TEXT NOT NULL COMMENT '帖子内容',
  `tags` JSON COMMENT '标签',
  `images` JSON COMMENT '图片URL列表',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `like_count` INT DEFAULT 0 COMMENT '点赞数',
  `comment_count` INT DEFAULT 0 COMMENT '评论数',
  `collect_count` INT DEFAULT 0 COMMENT '收藏数',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_create_time` (`create_time`),
  INDEX `idx_like_count` (`like_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区帖子表';

-- 6. 社区评论表
CREATE TABLE `community_comment` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '评论ID',
  `post_id` VARCHAR(64) NOT NULL COMMENT '帖子ID',
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `username` VARCHAR(100) NOT NULL COMMENT '用户名',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (`post_id`) REFERENCES `community_post`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  INDEX `idx_post_id` (`post_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区评论表';

-- 7. 社区点赞表
CREATE TABLE `community_like` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '点赞ID',
  `post_id` VARCHAR(64) NOT NULL COMMENT '帖子ID',
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_post_user` (`post_id`, `user_id`),
  FOREIGN KEY (`post_id`) REFERENCES `community_post`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  INDEX `idx_post_id` (`post_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区点赞表';

-- 8. 社区收藏表
CREATE TABLE `community_favorite` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '收藏ID',
  `post_id` VARCHAR(64) NOT NULL COMMENT '帖子ID',
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_post_user` (`post_id`, `user_id`),
  FOREIGN KEY (`post_id`) REFERENCES `community_post`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  INDEX `idx_post_id` (`post_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区收藏表';

-- 9. 商品表
CREATE TABLE `product` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '商品ID',
  `name` VARCHAR(200) NOT NULL COMMENT '商品名称',
  `description` TEXT COMMENT '商品描述',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `stock` INT DEFAULT 0 COMMENT '库存',
  `images` JSON COMMENT '图片URL列表',
  `category` VARCHAR(50) COMMENT '分类',
  `tags` JSON COMMENT '标签',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_category` (`category`),
  INDEX `idx_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 10. 专家表
CREATE TABLE `expert` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '专家ID',
  `name` VARCHAR(100) NOT NULL COMMENT '专家姓名',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `specialty` JSON COMMENT '擅长领域',
  `experience` INT COMMENT '从业年限',
  `description` TEXT COMMENT '简介',
  `hospital_id` VARCHAR(64) COMMENT '所属医院ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='专家表';

-- 11. 预约表
CREATE TABLE `appointment` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '预约ID',
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `pet_id` VARCHAR(64) NOT NULL COMMENT '宠物ID',
  `expert_id` VARCHAR(64) NOT NULL COMMENT '专家ID',
  `type` VARCHAR(50) NOT NULL COMMENT '服务类型',
  `appointment_time` TIMESTAMP NOT NULL COMMENT '预约时间',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态（pending/confirmed/completed/cancelled）',
  `note` TEXT COMMENT '备注',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`pet_id`) REFERENCES `pet`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`expert_id`) REFERENCES `expert`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_pet_id` (`pet_id`),
  INDEX `idx_expert_id` (`expert_id`),
  INDEX `idx_appointment_time` (`appointment_time`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约表';

-- 12. 症状库表
CREATE TABLE `symptom_database` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '症状ID',
  `name` VARCHAR(100) NOT NULL COMMENT '症状名称',
  `keywords` JSON COMMENT '关键词列表',
  `description` TEXT COMMENT '描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='症状库表';

-- 13. 病症库表
CREATE TABLE `disease_database` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '病症ID',
  `name` VARCHAR(100) NOT NULL COMMENT '病症名称',
  `symptoms` JSON COMMENT '关联症状',
  `description` TEXT COMMENT '描述',
  `severity` VARCHAR(20) COMMENT '严重程度（low/medium/high）',
  `recommend_products` JSON COMMENT '推荐商品',
  `recommend_tips` JSON COMMENT '建议',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_name` (`name`),
  INDEX `idx_severity` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='病症库表';

-- 14. 医院表
CREATE TABLE `hospital` (
  `id` VARCHAR(64) PRIMARY KEY COMMENT '医院ID',
  `name` VARCHAR(200) NOT NULL COMMENT '医院名称',
  `address` VARCHAR(500) COMMENT '地址',
  `latitude` DECIMAL(10, 6) COMMENT '纬度',
  `longitude` DECIMAL(10, 6) COMMENT '经度',
  `phone` VARCHAR(20) COMMENT '电话',
  `description` TEXT COMMENT '简介',
  `images` JSON COMMENT '图片URL列表',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='医院表';

-- 初始化数据

-- 初始化症状库
INSERT INTO `symptom_database` (`id`, `name`, `keywords`, `description`) VALUES
('symptom_1', '粪便稀软', JSON_ARRAY('稀便', '软便', '腹泻'), '粪便不成形，较软或呈水状'),
('symptom_2', '粪便干结', JSON_ARRAY('便秘', '排便困难'), '粪便干燥硬结，排便困难'),
('symptom_3', '食欲不佳', JSON_ARRAY('不吃饭', '食欲差', '厌食'), '食欲减退或完全不想吃东西'),
('symptom_4', '精神不振', JSON_ARRAY('没精神', '萎靡', '嗜睡'), '精神状态不佳，反应迟钝'),
('symptom_5', '掉毛严重', JSON_ARRAY('掉毛', '脱毛', '秃斑'), '异常掉毛，出现秃斑');

-- 初始化病症库
INSERT INTO `disease_database` (`id`, `name`, `symptoms`, `description`, `severity`, `recommend_products`, `recommend_tips`) VALUES
('disease_1', '肠胃炎', JSON_ARRAY('symptom_1', 'symptom_3'), '宠物常见疾病，主要症状为腹泻、食欲不振', 'medium', JSON_ARRAY('宠物益生菌', '肠胃调理粮'), JSON_ARRAY('建议暂时喂食易消化的食物', '避免油腻和生冷食物')),
('disease_2', '消化不良', JSON_ARRAY('symptom_1', 'symptom_3'), '消化系统功能紊乱', 'low', JSON_ARRAY('宠物益生菌'), JSON_ARRAY('可以尝试喂食益生菌帮助调理肠胃')),
('disease_3', '寄生虫感染', JSON_ARRAY('symptom_1'), '体内或体外寄生虫感染', 'medium', JSON_ARRAY('驱虫药'), JSON_ARRAY('定期进行驱虫', '注意环境卫生')),
('disease_4', '便秘', JSON_ARRAY('symptom_2'), '排便困难或排便次数减少', 'low', JSON_ARRAY('通便药'), JSON_ARRAY('增加饮水量', '适当运动')),
('disease_5', '脱水', JSON_ARRAY('symptom_2'), '体内水分不足', 'medium', JSON_ARRAY('电解质水'), JSON_ARRAY('及时补充水分', '必要时就医')),
('disease_6', '感冒', JSON_ARRAY('symptom_3', 'symptom_4'), '上呼吸道感染', 'medium', JSON_ARRAY('感冒药'), JSON_ARRAY('注意保暖', '避免受凉')),
('disease_7', '口腔疾病', JSON_ARRAY('symptom_3'), '口腔炎症、牙齿问题等', 'medium', JSON_ARRAY('口腔护理用品'), JSON_ARRAY('定期清洁口腔', '注意口腔卫生')),
('disease_8', '全身性疾病', JSON_ARRAY('symptom_3', 'symptom_4'), '可能涉及多个系统', 'high', JSON_ARRAY(), JSON_ARRAY('建议尽快就医', '进行全面检查')),
('disease_9', '皮肤病', JSON_ARRAY('symptom_5'), '皮肤炎症、真菌感染等', 'low', JSON_ARRAY('皮肤药膏'), JSON_ARRAY('保持皮肤清洁', '避免抓挠')),
('disease_10', '营养缺乏', JSON_ARRAY('symptom_5'), '营养摄入不足或不均衡', 'low', JSON_ARRAY('营养补充剂'), JSON_ARRAY('调整饮食结构', '补充必要营养素')),
('disease_11', '季节换毛', JSON_ARRAY('symptom_5'), '正常生理现象', 'low', JSON_ARRAY('化毛膏'), JSON_ARRAY('定期梳理毛发', '帮助排毛'));

-- 初始化医院
INSERT INTO `hospital` (`id`, `name`, `address`, `phone`, `description`) VALUES
('hospital_1', 'XX宠物医院', 'XX市XX区XX街道123号', '010-12345678', '专业宠物医疗机构，提供全面的宠物医疗服务'),
('hospital_2', 'YY宠物医院', 'XX市XX区XX路456号', '010-87654321', '现代化宠物医院，设备先进，服务专业');

-- 初始化专家
INSERT INTO `expert` (`id`, `name`, `specialty`, `experience`, `description`, `hospital_id`) VALUES
('expert_1', '张兽医', JSON_ARRAY('内科疾病', '肠胃疾病'), 15, '擅长内科疾病和肠胃疾病诊疗，经验丰富', 'hospital_1'),
('expert_2', '李兽医', JSON_ARRAY('皮肤病', '外科手术'), 10, '擅长皮肤病治疗和外科手术', 'hospital_2');

-- 初始化商品
INSERT INTO `product` (`id`, `name`, `description`, `price`, `stock`, `category`) VALUES
('product_1', '宠物益生菌', '调理肠胃，改善消化', 39.9, 100, '保健品'),
('product_2', '肠胃调理粮', '易消化，适合肠胃敏感宠物', 129.9, 50, '食品'),
('product_3', '化毛膏', '帮助猫咪排出毛球', 29.9, 80, '保健品'),
('product_4', '驱虫药', '预防体内体外寄生虫', 49.9, 120, '药品'),
('product_5', '皮肤药膏', '治疗宠物皮肤病', 59.9, 60, '药品');
