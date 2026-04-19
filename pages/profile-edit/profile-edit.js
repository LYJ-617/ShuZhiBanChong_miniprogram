// pages/profile-edit/profile-edit.js
const app = getApp();

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    userInfo: null,
    formData: {
      nickname: '',
      phone: '',
      verifyCode: '',
      gender: '',
      petPreference: [],
      region: '',
      signature: '',
      petDuration: '',
      petCount: 1
    },
    showVerifyCode: false,
    verifyBtnText: '获取验证码',
    canSendVerify: true,
    countdown: 0,
    showRegionPicker: false,
    provinces: [],
    cities: [],
    districts: [],
    regionIndex: [0, 0, 0],
    tempRegion: { province: '', city: '', district: '' }
  },

  onLoad() {
    this.initSystemInfo();
    this.loadUserInfo();
    this.initRegionData();
  },

  initSystemInfo() {
    const sys = wx.getSystemInfoSync();
    const statusBarHeight = (sys.statusBarHeight || 20) * 2;
    this.setData({ statusBarHeight });
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      const parsed = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
      this.setData({
        userInfo: parsed,
        formData: {
          nickname: parsed.nickname || parsed.username || '',
          phone: parsed.phone || '',
          verifyCode: parsed.verifyCode || '',
          gender: parsed.gender || '',
          petPreference: parsed.petPreference || [],
          region: parsed.region || '',
          signature: parsed.signature || '',
          petDuration: parsed.petDuration || '',
          petCount: parsed.petCount || 1
        }
      });
    }
  },

  // 初始化地区数据
  initRegionData() {
    const regions = require('./region.js');
    this.setData({
      provinces: regions.provinces,
      cities: regions.cities[0] || [],
      districts: regions.districts[0] || [0] || []
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        const userInfo = this.data.userInfo || {};
        userInfo.avatarUrl = tempFilePath;
        this.setData({ userInfo });
      }
    });
  },

  // 昵称输入
  onNicknameInput(e) {
    const formData = this.data.formData;
    formData.nickname = e.detail.value;
    this.setData({ formData });
  },

  // 手机号输入
  onPhoneInput(e) {
    const formData = this.data.formData;
    formData.phone = e.detail.value;
    this.setData({ formData });
    // 检查是否需要显示验证码
    const phone = formData.phone;
    this.setData({
      canSendVerify: /^1[3-9]\d{9}$/.test(phone)
    });
  },

  // 发送验证码
  sendVerifyCode() {
    if (!this.data.canSendVerify || this.data.countdown > 0) return;

    const phone = this.data.formData.phone;
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    // 模拟发送验证码
    wx.showToast({ title: '验证码已发送', icon: 'success' });
    this.setData({ showVerifyCode: true });

    // 开始倒计时
    let countdown = 60;
    this.setData({ countdown, canSendVerify: false, verifyBtnText: `${countdown}秒后重试` });
    const timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({ countdown: 0, canSendVerify: true, verifyBtnText: '获取验证码' });
      } else {
        this.setData({ countdown, verifyBtnText: `${countdown}秒后重试` });
      }
    }, 1000);
  },

  // 验证码输入
  onVerifyCodeInput(e) {
    const formData = this.data.formData;
    formData.verifyCode = e.detail.value;
    this.setData({ formData });
  },

  // 选择性别
  selectGender(e) {
    const gender = e.currentTarget.dataset.gender;
    const formData = this.data.formData;
    formData.gender = formData.gender === gender ? '' : gender;
    this.setData({ formData });
  },

  // 切换宠物偏好
  togglePetPreference(e) {
    const pet = e.currentTarget.dataset.pet;
    const formData = this.data.formData;
    const preferences = formData.petPreference;
    const index = preferences.indexOf(pet);
    if (index > -1) {
      preferences.splice(index, 1);
    } else {
      preferences.push(pet);
    }
    formData.petPreference = preferences;
    this.setData({ formData });
  },

  // 简介输入
  onSignatureInput(e) {
    const formData = this.data.formData;
    formData.signature = e.detail.value;
    this.setData({ formData });
  },

  // 选择地区
  selectRegion() {
    this.setData({ showRegionPicker: true });
  },

  closeRegionPicker() {
    this.setData({ showRegionPicker: false });
  },

  onRegionChange(e) {
    const values = e.detail.value;
    const provinceIndex = values[0];
    const cityIndex = values[1];
    const districtIndex = values[2];

    // 更新城市列表
    const regions = require('./region.js');
    const newCities = regions.cities[provinceIndex] || [];
    const newDistricts = regions.districts[provinceIndex]?.[cityIndex] || [];

    // 如果当前选中的城市或区县超出范围，重置
    const newCityIndex = Math.min(cityIndex, newCities.length - 1);
    const newDistrictIndex = Math.min(districtIndex, newDistricts.length - 1);

    this.setData({
      regionIndex: [provinceIndex, newCityIndex, newDistrictIndex],
      cities: newCities,
      districts: newDistricts
    });
  },

  confirmRegion() {
    const { provinces, cities, districts, regionIndex } = this.data;
    const formData = this.data.formData;
    formData.region = `${provinces[regionIndex[0]] || ''} ${cities[regionIndex[1]] || ''} ${districts[regionIndex[2]] || ''}`;
    this.setData({ formData, showRegionPicker: false });
  },

  // 选择养宠时长
  selectDuration(e) {
    const duration = e.currentTarget.dataset.duration;
    const formData = this.data.formData;
    formData.petDuration = formData.petDuration === duration ? '' : duration;
    this.setData({ formData });
  },

  // 减少宠物数量
  decreasePetCount() {
    const formData = this.data.formData;
    if (formData.petCount > 1) {
      formData.petCount--;
      this.setData({ formData });
    }
  },

  // 增加宠物数量
  increasePetCount() {
    const formData = this.data.formData;
    if (formData.petCount < 20) {
      formData.petCount++;
      this.setData({ formData });
    }
  },

  // 保存资料
  saveProfile() {
    const { formData, userInfo } = this.data;

    // 验证昵称
    if (!formData.nickname || !formData.nickname.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    // 验证手机号格式（如果填写）
    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    // 验证验证码（如果手机号已填写）
    if (formData.phone && formData.verifyCode && formData.verifyCode.length !== 6) {
      wx.showToast({ title: '请输入6位验证码', icon: 'none' });
      return;
    }

    // 合并用户信息
    const newUserInfo = {
      ...userInfo,
      ...formData,
      username: formData.nickname
    };

    // 保存到本地存储
    wx.setStorageSync('userInfo', newUserInfo);

    // 同步更新全局数据
    if (app.globalData) {
      app.globalData.userInfo = newUserInfo;
    }

    wx.showToast({ title: '保存成功', icon: 'success' });

    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
});
