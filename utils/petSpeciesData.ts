/**
 * 数智伴宠小程序 - 宠物种类-品种完整数据库
 * 数据结构：宠物大类 → 宠物小类 → 品种列表
 * 管控类品种已标注，可通过isControlBreed函数判断
 */

// 类型定义
export interface PetSpeciesMap {
  [大类: string]: {
    [小类: string]: string[];
  };
}

// 完整宠物种类-品种数据库
export const petSpeciesMap: PetSpeciesMap = {
  "哺乳类": {
    "犬科（狗）": [
      "德国牧羊犬", "罗威纳犬", "西伯利亚哈士奇", "阿拉斯加雪橇犬", "秋田犬",
      "边境牧羊犬", "贵宾犬", "苏格兰牧羊犬", "澳大利亚牧牛犬",
      "拉布拉多", "金毛寻回犬", "可卡犬", "波音达犬",
      "比格犬", "腊肠犬", "阿富汗猎犬", "寻血猎犬",
      "杰克罗素梗", "苏格兰梗", "西高地白梗", "牛头梗",
      "博美犬", "吉娃娃", "比熊犬", "马尔济斯犬", "法国斗牛犬", "英国斗牛犬", "柯基犬", "柴犬", "中华田园犬",
      "松狮犬", "沙皮犬", "大麦町犬"
    ],
    "猫科（猫）": [
      "英国短毛猫", "美国短毛猫", "暹罗猫", "孟加拉猫", "德文卷毛猫", "苏格兰折耳猫", "加菲猫（异国短毛猫）", "中华田园猫",
      "布偶猫", "波斯猫", "金吉拉", "缅因猫", "挪威森林猫", "安哥拉猫"
    ],
    "小型哺乳类": [
      "金丝熊（仓鼠）", "布丁（仓鼠）", "银狐（仓鼠）", "三线（仓鼠）", "龙猫", "豚鼠（荷兰猪）",
      "魔王松鼠", "金花松鼠", "通心粉鼠", "花枝鼠",
      "垂耳兔", "侏儒兔", "安哥拉兔", "猫猫兔", "狮子头兔", "中华野兔",
      "安哥鲁雪貂", "玛雪儿雪貂", "非洲迷你刺猬", "蜜袋鼯", "羊驼", "小香猪", "柯尔鸭"
    ],
    "其他特色哺乳类": [
      "宠物狐狸", "水獭", "矮马", "宠物猴（管控）"
    ]
  },
  "鸟类": {
    "鹦鹉科": [
      "虎皮鹦鹉", "玄凤鹦鹉", "牡丹鹦鹉", "和尚鹦鹉", "非洲灰鹦鹉", "金刚鹦鹉", "葵花凤头鹦鹉", "折衷鹦鹉"
    ],
    "鸣禽类": [
      "金丝雀", "画眉", "百灵", "靛颏", "绣眼鸟", "八哥", "鹩哥"
    ],
    "观赏类": [
      "信鸽", "观赏鸽", "孔雀", "文鸟", "珍珠鸟", "七彩文鸟", "芦丁鸡"
    ],
    "其他特色鸟类": [
      "鸵鸟", "鸸鹋"
    ]
  },
  "水族类": {
    "温带淡水鱼": [
      "草金", "龙睛", "兰寿", "锦鲤", "红鲫鱼"
    ],
    "热带淡水鱼": [
      "孔雀鱼", "红绿灯", "神仙鱼", "七彩神仙鱼", "银龙鱼", "红龙鱼", "金龙鱼", "地图鱼", "罗汉鱼", "清道夫", "六角恐龙"
    ],
    "热带海水鱼": [
      "小丑鱼", "蓝吊", "女王神仙", "海马", "水母"
    ]
  },
  "两栖爬行类": {
    "龟类": [
      "巴西龟", "草龟", "鳄龟", "苏卡达陆龟", "辐射陆龟", "黄缘闭壳龟"
    ],
    "蜥蜴类": [
      "鬃狮蜥", "绿鬣蜥", "豹纹守宫", "变色龙", "平原巨蜥"
    ],
    "蛇类": [
      "玉米蛇", "王蛇", "奶蛇", "球蟒（管控）", "赤链蛇"
    ],
    "两栖类": [
      "角蛙", "牛蛙", "红眼树蛙", "蝾螈", "娃娃鱼"
    ],
    "其他特色爬行类": [
      "鳄鱼（管控）", "鬣蜥", "石龙子"
    ]
  },
  "节肢/无脊椎类": {
    "昆虫类": [
      "独角仙", "锹甲", "螳螂", "蟋蟀", "宠物蚂蚁", "蝴蝶", "蚕"
    ],
    "蛛形纲": [
      "智利红玫瑰蜘蛛", "捕鸟蛛", "雨林蝎", "帝王蝎"
    ],
    "其他": [
      "蜗牛", "马陆", "西瓜虫"
    ]
  }
};

/**
 * 工具函数：获取所有宠物大类列表
 * @returns 宠物大类数组
 */
export const getPetCategoryList = (): string[] => {
  return Object.keys(petSpeciesMap);
};

/**
 * 工具函数：根据宠物大类，获取对应的宠物小类列表
 * @param category 宠物大类
 * @returns 宠物小类数组
 */
export const getPetTypeList = (category: string): string[] => {
  if (!category || !petSpeciesMap[category]) return [];
  return Object.keys(petSpeciesMap[category]);
};

/**
 * 工具函数：根据宠物大类+小类，获取对应的品种列表
 * @param category 宠物大类
 * @param type 宠物小类
 * @returns 品种名称数组
 */
export const getPetBreedList = (category: string, type: string): string[] => {
  if (!category || !type || !petSpeciesMap[category]?.[type]) return [];
  return petSpeciesMap[category][type];
};

/**
 * 工具函数：判断品种是否为管控类
 * @param breedName 品种名称
 * @returns 是否为管控类
 */
export const isControlBreed = (breedName: string): boolean => {
  return breedName.includes("（管控）");
};

/**
 * 工具函数：获取完整的三级联动数据
 * @returns 适用于picker的二维数组
 */
export const getPetPickerData = (): string[][] => {
  const categories = getPetCategoryList();
  const pickerData: string[][] = [];
  
  categories.forEach(category => {
    const types = getPetTypeList(category);
    types.forEach(type => {
      pickerData.push([category, type]);
    });
  });
  
  return pickerData;
};

/**
 * 工具函数：根据选择结果获取品种列表
 * @param category 宠物大类
 * @param type 宠物小类
 * @param breedIndex 品种索引
 * @returns 品种名称
 */
export const getSelectedBreed = (category: string, type: string, breedIndex: number): string => {
  const breeds = getPetBreedList(category, type);
  return breeds[breedIndex] || '';
};

/**
 * 工具函数：获取默认的宠物大类索引
 * @returns 默认索引
 */
export const getDefaultCategoryIndex = (): number => {
  return 0;
};

/**
 * 工具函数：获取默认的宠物小类索引
 * @param category 宠物大类
 * @returns 默认索引
 */
export const getDefaultTypeIndex = (category: string): number => {
  const types = getPetTypeList(category);
  return types.length > 0 ? 0 : -1;
};