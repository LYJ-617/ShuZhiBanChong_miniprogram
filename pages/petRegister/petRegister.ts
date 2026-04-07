// pages/petRegister/petRegister.ts
// 宠物种类-品种映射表（可后续对接数据库动态更新）
const PetTypeBreedMap = {
  "猫": ["英短", "美短", "布偶", "暹罗", "橘猫", "狸花猫", "加菲猫", "波斯猫", "折耳猫", "曼基康", "德文卷毛猫", "其他"],
  "狗": ["金毛", "泰迪", "柯基", "哈士奇", "萨摩耶", "拉布拉多", "柴犬", "边牧", "德牧", "博美", "比熊", "阿拉斯加", "其他"],
  "仓鼠": ["金丝熊", "三线仓鼠", "一线仓鼠", "布丁仓鼠", "银狐仓鼠", "紫仓", "公婆仓鼠", "其他"],
  "兔子": ["垂耳兔", "侏儒兔", "猫猫兔", "肉兔", "安哥拉兔", "道奇兔", "其他"],
  "龙猫": ["毛丝鼠", "短尾龙猫", "长尾龙猫", "其他"],
  "豚鼠": ["荷兰猪", "短顺豚鼠", "长逆豚鼠", "泰迪豚鼠", "其他"],
  "鸟类": ["鹦鹉", "八哥", "画眉", "百灵", "文鸟", "玄凤", "牡丹鹦鹉", "虎皮鹦鹉", "其他"],
  "鱼类": ["金鱼", "锦鲤", "孔雀鱼", "斗鱼", "龙鱼", "罗汉鱼", "其他"],
  "爬行类": ["乌龟", "蜥蜴", "蛇", "守宫", "角蛙", "其他"],
  "两栖类": ["青蛙", "蝾螈", "娃娃鱼", "其他"]
};

// 基础常量
const PetTypeList = Object.keys(PetTypeBreedMap);
const GenderList = ["公", "母"];

Page({
  /**
   * 页面初始数据
   */
  data: {
    // 表单数据
    formData: {
      petName: "",
      petTypeIndex: -1,
      breedIndex: -1,
      genderIndex: -1,
      birthday: "",
      petHobby: ""
    },
    petTypeList: PetTypeList,
    currentBreedList: [] as string[],
    genderList: GenderList,
    today: "" // 今天的日期，限制生日不能选未来时间
  },

  /**
   * 输入框内容同步
   */
  onInputChange(e: WechatMiniprogram.InputEvent) {
    const field = e.currentTarget.dataset.name;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  /**
   * 宠物种类选择变更，联动更新品种列表
   */
  onPetTypeChange(e: WechatMiniprogram.PickerChange) {
    const index = Number(e.detail.value);
    const selectedType = this.data.petTypeList[index];
    const breedList = PetTypeBreedMap[selectedType as keyof typeof PetTypeBreedMap];
    
    this.setData({
      "formData.petTypeIndex": index,
      "formData.breedIndex": -1,
      currentBreedList: breedList
    });
  },

  /**
   * 宠物品种选择变更
   */
  onBreedChange(e: WechatMiniprogram.PickerChange) {
    this.setData({
      "formData.breedIndex": Number(e.detail.value)
    });
  },

  /**
   * 性别选择变更
   */
  onGenderChange(e: WechatMiniprogram.PickerChange) {
    this.setData({
      "formData.genderIndex": Number(e.detail.value)
    });
  },

  /**
   * 生日选择变更
   */
  onBirthdayChange(e: WechatMiniprogram.DatePickerChange) {
    this.setData({
      "formData.birthday": e.detail.value
    });
  },

  /**
   * 表单提交与必填校验
   */
  submitForm() {
    const { formData, petTypeList, currentBreedList, genderList } = this.data;

    // 1. 必填项校验
    if (!formData.petName.trim()) {
      wx.showToast({ title: '请输入宠物名称', icon: 'none' });
      return;
    }
    if (formData.petTypeIndex === -1) {
      wx.showToast({ title: '请选择宠物种类', icon: 'none' });
      return;
    }
    if (formData.breedIndex === -1) {
      wx.showToast({ title: '请选择宠物品种', icon: 'none' });
      return;
    }
    if (formData.genderIndex === -1) {
      wx.showToast({ title: '请选择宠物性别', icon: 'none' });
      return;
    }
    if (!formData.birthday) {
      wx.showToast({ title: '请选择宠物生日', icon: 'none' });
      return;
    }

    // 2. 组装完整宠物数据
    const petFullData = {
      petName: formData.petName.trim(),
      petType: petTypeList[formData.petTypeIndex],
      breed: currentBreedList[formData.breedIndex],
      gender: genderList[formData.genderIndex],
      birthday: formData.birthday,
      petHobby: formData.petHobby.trim()
    };
    console.log('提交的宠物信息：', petFullData);

    // --------------------------
    // 【后端对接区】
    // 此处调用后端接口，提交宠物信息到服务器
    // 提交成功后，存储宠物信息到本地缓存
    // --------------------------
    wx.showLoading({ title: '提交中...', mask: true });
    setTimeout(() => {
      wx.hideLoading();
      // 存储注册状态与宠物信息
      wx.setStorageSync('currentPetInfo', petFullData);
      wx.setStorageSync('hasRegisterPet', true);

      wx.showToast({ title: '注册成功', icon: 'success', duration: 1000 });
      // 注册成功跳首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1000);
    }, 1500);
  },

  /**
   * 页面加载初始化
   */
  onLoad() {
    // 初始化今天的日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.setData({
      today: `${year}-${month}-${day}`
    });

    // 已注册宠物直接跳首页
    const hasRegisterPet = wx.getStorageSync('hasRegisterPet');
    const isLogin = wx.getStorageSync('isLogin');
    if (isLogin && hasRegisterPet) {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },
})