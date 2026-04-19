// pages/pet-edit/pet-edit.js
const app = getApp();

// 品种数据
const BREED_DATA = {
  dog: [
    { id: 'd1', name: '中华田园犬' },
    { id: 'd2', name: '金毛' },
    { id: 'd3', name: '拉布拉多' },
    { id: 'd4', name: '柯基' },
    { id: 'd5', name: '泰迪/贵宾' },
    { id: 'd6', name: '比熊' },
    { id: 'd7', name: '哈士奇' },
    { id: 'd8', name: '萨摩耶' },
    { id: 'd9', name: '柴犬' },
    { id: 'd10', name: '边牧' },
    { id: 'd11', name: '博美' },
    { id: 'd12', name: '吉娃娃' },
    { id: 'd13', name: '雪纳瑞' },
    { id: 'd14', name: '斗牛犬' },
    { id: 'd15', name: '杜宾' },
    { id: 'd16', name: '德牧' },
    { id: 'd17', name: '阿拉斯加' },
    { id: 'd18', name: '松狮' },
    { id: 'd19', name: '巴哥' },
    { id: 'd20', name: '其他' }
  ],
  cat: [
    { id: 'c1', name: '中华田园猫' },
    { id: 'c2', name: '英短' },
    { id: 'c3', name: '美短' },
    { id: 'c4', name: '布偶' },
    { id: 'c5', name: '暹罗' },
    { id: 'c6', name: '加菲' },
    { id: 'c7', name: '波斯' },
    { id: 'c8', name: '缅因' },
    { id: 'c9', name: '狸花' },
    { id: 'c10', name: '蓝猫' },
    { id: 'c11', name: '金吉拉' },
    { id: 'c12', name: '无毛猫' },
    { id: 'c13', name: '阿比西尼亚' },
    { id: 'c14', name: '苏格兰折耳' },
    { id: 'c15', name: '其他' }
  ],
  other: [
    { id: 'o1', name: '仓鼠' },
    { id: 'o2', name: '豚鼠' },
    { id: 'o3', name: '兔子' },
    { id: 'o4', name: '龙猫' },
    { id: 'o5', name: '刺猬' },
    { id: 'o6', name: '乌龟' },
    { id: 'o7', name: '观赏鱼' },
    { id: 'o8', name: '蜥蜴' },
    { id: 'o9', name: '蛇' },
    { id: 'o10', name: '其他' }
  ]
};

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    petId: '',
    formData: {
      photos: [],
      petName: '',
      petType: '',
      breed: '',
      gender: '',
      ageYears: '',
      ageMonths: '',
      weight: '',
      isNeutered: null,
      vaccines: [],
      lastVaccineDate: '',
      deworming: '',
      healthStatus: '',
      medicalHistory: '',
      feedingReminder: { enabled: false, times: ['08:00'] },
      vaccineReminder: { enabled: false, nextDate: '' },
      dewormingReminder: { enabled: false, nextDate: '' },
      bathReminder: { enabled: false, nextDate: '' },
      checkupReminder: { enabled: false, nextDate: '' }
    },
    breedList: [],
    originalData: null
  },

  onLoad(options) {
    this.initSystemInfo();
    if (options.petId) {
      this.setData({ petId: options.petId });
      this.loadPetData(options.petId);
    }
  },

  initSystemInfo() {
    const sys = wx.getSystemInfoSync();
    const statusBarHeight = (sys.statusBarHeight || 20) * 2;
    this.setData({ statusBarHeight });
  },

  // 加载宠物数据
  loadPetData(petId) {
    const petList = wx.getStorageSync('petList') || [];
    const pet = petList.find(p => p.id === petId);
    if (pet) {
      // 转换petType
      let petType = '';
      if (pet.type === '狗狗') petType = 'dog';
      else if (pet.type === '猫咪') petType = 'cat';
      else petType = 'other';

      // 获取品种列表
      const breedList = BREED_DATA[petType] || [];

      this.setData({
        formData: {
          photos: pet.photos || [],
          petName: pet.petName || '',
          petType: petType,
          breed: pet.breed || '',
          gender: pet.gender || '',
          ageYears: pet.ageYears || '',
          ageMonths: pet.ageMonths || '',
          weight: pet.weight || '',
          isNeutered: pet.isNeutered,
          vaccines: pet.vaccines || [],
          lastVaccineDate: pet.lastVaccineDate || '',
          deworming: pet.deworming || '',
          healthStatus: pet.healthStatus || '',
          medicalHistory: pet.medicalHistory || '',
          feedingReminder: pet.feedingReminder || { enabled: false, times: ['08:00'] },
          vaccineReminder: pet.vaccineReminder || { enabled: false, nextDate: '' },
          dewormingReminder: pet.dewormingReminder || { enabled: false, nextDate: '' },
          bathReminder: pet.bathReminder || { enabled: false, nextDate: '' },
          checkupReminder: pet.checkupReminder || { enabled: false, nextDate: '' }
        },
        breedList,
        originalData: JSON.stringify(pet)
      });
    } else {
      wx.showToast({ title: '宠物不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  goBack() {
    // 检查是否有修改
    const currentData = JSON.stringify(this.data.formData);
    if (currentData !== this.data.originalData) {
      wx.showModal({
        title: '提示',
        content: '您有未保存的修改，确定要返回吗？',
        confirmText: '返回',
        cancelText: '继续编辑',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  // 添加照片
  addPhoto() {
    if (this.data.formData.photos.length >= 9) {
      wx.showToast({ title: '最多上传9张照片', icon: 'none' });
      return;
    }
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['camera'] : ['album'];
        const count = 9 - this.data.formData.photos.length;
        wx.chooseMedia({
          count: count,
          mediaType: ['image'],
          sourceType: sourceType,
          success: (res) => {
            const newPhotos = res.tempFiles.map(f => f.tempFilePath);
            const formData = this.data.formData;
            formData.photos = [...formData.photos, ...newPhotos].slice(0, 9);
            this.setData({ formData });
          }
        });
      }
    });
  },

  // 设置主图（设为头像）
  chooseAvatar() {
    if (this.data.formData.photos.length === 0) {
      wx.showToast({ title: '请先添加照片', icon: 'none' });
      return;
    }
    const formData = this.data.formData;
    const avatar = formData.photos[0];
    formData.avatar = avatar;
    this.setData({ formData });
    wx.showToast({ title: '已设为主图', icon: 'success' });
  },

  // 清空照片
  clearPhotos() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有照片吗？',
      success: (res) => {
        if (res.confirm) {
          const formData = this.data.formData;
          formData.photos = [];
          this.setData({ formData });
        }
      }
    });
  },

  // 宠物名称输入
  onNameInput(e) {
    const formData = this.data.formData;
    formData.petName = e.detail.value;
    this.setData({ formData });
  },

  // 选择宠物类型
  selectPetType(e) {
    const petType = e.currentTarget.dataset.type;
    const formData = this.data.formData;
    if (formData.petType !== petType) {
      formData.petType = petType;
      formData.breed = '';
      const breedList = BREED_DATA[petType] || [];
      this.setData({ formData, breedList });
    }
  },

  // 品种选择
  onBreedChange(e) {
    const index = e.detail.value;
    const breed = this.data.breedList[index];
    const formData = this.data.formData;
    formData.breed = breed ? breed.name : '';
    this.setData({ formData });
  },

  // 性别选择
  selectGender(e) {
    const gender = e.currentTarget.dataset.gender;
    const formData = this.data.formData;
    formData.gender = formData.gender === gender ? '' : gender;
    this.setData({ formData });
  },

  // 年龄输入
  onAgeYearsInput(e) {
    const formData = this.data.formData;
    formData.ageYears = e.detail.value;
    this.setData({ formData });
  },

  onAgeMonthsInput(e) {
    const formData = this.data.formData;
    formData.ageMonths = e.detail.value;
    this.setData({ formData });
  },

  // 体重输入
  onWeightInput(e) {
    const formData = this.data.formData;
    formData.weight = e.detail.value;
    this.setData({ formData });
  },

  // 绝育选择
  selectNeutered(e) {
    const value = e.currentTarget.dataset.value;
    const formData = this.data.formData;
    formData.isNeutered = value === 'true';
    this.setData({ formData });
  },

  // 疫苗选择
  toggleVaccine(e) {
    const vaccine = e.currentTarget.dataset.vaccine;
    const formData = this.data.formData;
    const vaccines = formData.vaccines;
    const index = vaccines.indexOf(vaccine);
    if (index > -1) {
      vaccines.splice(index, 1);
    } else {
      vaccines.push(vaccine);
    }
    formData.vaccines = vaccines;
    this.setData({ formData });
  },

  // 疫苗日期
  onVaccineDateChange(e) {
    const formData = this.data.formData;
    formData.lastVaccineDate = e.detail.value;
    this.setData({ formData });
  },

  // 驱虫选择
  selectDeworming(e) {
    const deworming = e.currentTarget.dataset.deworming;
    const formData = this.data.formData;
    formData.deworming = formData.deworming === deworming ? '' : deworming;
    this.setData({ formData });
  },

  // 健康状态选择
  selectHealthStatus(e) {
    const healthStatus = e.currentTarget.dataset.status;
    const formData = this.data.formData;
    formData.healthStatus = formData.healthStatus === healthStatus ? '' : healthStatus;
    this.setData({ formData });
  },

  // 既往病史
  onMedicalHistoryInput(e) {
    const formData = this.data.formData;
    formData.medicalHistory = e.detail.value;
    this.setData({ formData });
  },

  // ========== 提醒相关 ==========
  // 切换提醒开关
  toggleReminder(e) {
    const type = e.currentTarget.dataset.type;
    const enabled = e.detail.value;
    const formData = this.data.formData;
    formData[type].enabled = enabled;
    this.setData({ formData });
  },

  // 喂食时间修改
  onFeedingTimeChange(e) {
    const index = e.detail.value;
    const formData = this.data.formData;
    formData.feedingReminder.times[index] = index;
    this.setData({ formData });
  },

  // 添加喂食时间
  addFeedingTime() {
    const formData = this.data.formData;
    if (formData.feedingReminder.times.length < 4) {
      formData.feedingReminder.times.push('12:00');
      this.setData({ formData });
    }
  },

  // 删除喂食时间
  deleteFeedingTime(e) {
    const index = e.currentTarget.dataset.index;
    const formData = this.data.formData;
    if (formData.feedingReminder.times.length > 1) {
      formData.feedingReminder.times.splice(index, 1);
      this.setData({ formData });
    }
  },

  // 疫苗提醒日期
  onVaccineReminderDateChange(e) {
    const formData = this.data.formData;
    formData.vaccineReminder.nextDate = e.detail.value;
    this.setData({ formData });
  },

  // 驱虫提醒日期
  onDewormingReminderDateChange(e) {
    const formData = this.data.formData;
    formData.dewormingReminder.nextDate = e.detail.value;
    this.setData({ formData });
  },

  // 洗澡提醒日期
  onBathReminderDateChange(e) {
    const formData = this.data.formData;
    formData.bathReminder.nextDate = e.detail.value;
    this.setData({ formData });
  },

  // 复诊提醒日期
  onCheckupReminderDateChange(e) {
    const formData = this.data.formData;
    formData.checkupReminder.nextDate = e.detail.value;
    this.setData({ formData });
  },

  // 保存修改
  savePet() {
    const { formData, petId } = this.data;

    // 验证必填项
    if (!formData.petName || !formData.petName.trim()) {
      wx.showToast({ title: '请输入宠物名称', icon: 'none' });
      return;
    }

    if (!formData.petType) {
      wx.showToast({ title: '请选择宠物类型', icon: 'none' });
      return;
    }

    if (!formData.breed) {
      wx.showToast({ title: '请选择品种', icon: 'none' });
      return;
    }

    // 计算年龄字符串
    let ageStr = '';
    if (formData.ageYears) ageStr += `${formData.ageYears}岁`;
    if (formData.ageMonths) ageStr += `${formData.ageMonths}月`;

    // 构建更新后的宠物对象
    const updatedPet = {
      id: petId,
      petName: formData.petName.trim(),
      avatar: formData.avatar || (formData.photos.length > 0 ? formData.photos[0] : ''),
      photos: formData.photos,
      type: formData.petType === 'dog' ? '狗狗' : formData.petType === 'cat' ? '猫咪' : '其他',
      breed: formData.breed,
      gender: formData.gender,
      age: ageStr,
      ageYears: formData.ageYears,
      ageMonths: formData.ageMonths,
      weight: formData.weight,
      isNeutered: formData.isNeutered,
      vaccines: formData.vaccines,
      lastVaccineDate: formData.lastVaccineDate,
      deworming: formData.deworming,
      healthStatus: formData.healthStatus,
      medicalHistory: formData.medicalHistory,
      feedingReminder: formData.feedingReminder,
      vaccineReminder: formData.vaccineReminder,
      dewormingReminder: formData.dewormingReminder,
      bathReminder: formData.bathReminder,
      checkupReminder: formData.checkupReminder,
      updateTime: new Date().toISOString()
    };

    // 确认保存
    wx.showModal({
      title: '确认保存',
      content: '确定要保存对宠物信息的修改吗？',
      confirmText: '保存',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 更新宠物列表
          const petList = wx.getStorageSync('petList') || [];
          const index = petList.findIndex(p => p.id === petId);
          if (index > -1) {
            petList[index] = updatedPet;
            wx.setStorageSync('petList', petList);

            // 同步全局数据
            if (app.globalData) {
              app.globalData.petList = petList;
              // 如果是当前宠物，更新当前宠物信息
              if (app.globalData.currentPetInfo && app.globalData.currentPetInfo.id === petId) {
                app.globalData.currentPetInfo = updatedPet;
              }
            }

            wx.showToast({ title: '保存成功', icon: 'success' });
            setTimeout(() => wx.navigateBack(), 1500);
          }
        }
      }
    });
  },

  // 删除宠物
  deletePet() {
    wx.showModal({
      title: '确认删除',
      content: `确定要删除宠物「${this.data.formData.petName}」吗？删除后将同步删除该宠物的所有日志、日程和AI报告，此操作不可恢复。`,
      confirmText: '删除',
      cancelText: '取消',
      confirmColor: '#f5222d',
      success: (res) => {
        if (res.confirm) {
          const { petId } = this.data;
          let petList = wx.getStorageSync('petList') || [];
          petList = petList.filter(p => p.id !== petId);
          wx.setStorageSync('petList', petList);

          // 同步全局数据
          if (app.globalData) {
            app.globalData.petList = petList;
            // 如果删除的是当前宠物，切换到第一个
            if (app.globalData.currentPetInfo && app.globalData.currentPetInfo.id === petId) {
              app.globalData.currentPetInfo = petList.length > 0 ? petList[0] : null;
            }
          }

          wx.showToast({ title: '删除成功', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      }
    });
  }
});
