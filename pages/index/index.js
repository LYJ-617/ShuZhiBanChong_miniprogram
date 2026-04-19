Page({
  data: {
    username: '',
    statusBarTop: 20,
    safeBottom: 20,
    petIndex: 0,
    selectedPetId: '',
    selectedPetName: '',
    petList: [],
    scheduleList: [],
    hasTodayLog: false,
    todayLog: null
  },

  onLoad() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - ((sys.safeArea && sys.safeArea.bottom) || sys.screenHeight)) || 0) * 2;
    this.setData({ statusBarTop, safeBottom });
    this.loadData();
  },

  onShow() {
    // 每次显示刷新数据
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    this.refreshByPet();
  },

  onPullDownRefresh() {
    this.refreshByPet();
    wx.stopPullDownRefresh();
  },

  loadData() {
    const userInfo = wx.getStorageSync('userInfo');
    const petList = wx.getStorageSync('petList') || [];
    
    if (!userInfo) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }

    this.setData({
      username: userInfo.username || '主人',
      petList,
      petIndex: 0,
      selectedPetId: petList[0]?.id || '',
      selectedPetName: petList[0]?.petName || ''
    });

    this.refreshByPet();
  },

  // 宠物切换
  onPetChange(e) {
    const index = Number(e.detail.value);
    const pet = this.data.petList[index];
    if (!pet) return;
    
    this.setData({
      selectedPetId: pet.id,
      selectedPetName: pet.petName,
      petIndex: index
    });
    
    // 切换后同步更新日程提醒和日志
    this.refreshByPet();
  },

  // 根据当前宠物刷新数据
  refreshByPet() {
    const petId = this.data.selectedPetId;
    if (!petId) return;

    // 获取当前宠物的日志
    const logs = wx.getStorageSync('petLogs') || [];
    const petLogs = logs.filter(item => item.petId === petId);
    
    // 筛选今日日志
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayLogs = petLogs.filter(log => {
      const logDate = new Date(log.createTime).toISOString().split('T')[0];
      return logDate === todayStr;
    });

    // 获取未来3天内的日程提醒
    const schedules = wx.getStorageSync('petSchedules') || [];
    const now = Date.now();
    const threeDaysLater = now + 3 * 24 * 3600 * 1000;
    
    const petSchedules = schedules
      .filter(item => item.petId === petId)
      .filter(item => {
        const scheduleTime = new Date(item.time || item.date).getTime();
        return !isNaN(scheduleTime) && scheduleTime >= now && scheduleTime <= threeDaysLater;
      })
      .slice(0, 6);

    this.setData({
      hasTodayLog: todayLogs.length > 0,
      todayLog: todayLogs.length > 0 ? {
        ...todayLogs[0],
        content: (todayLogs[0].content || '').slice(0, 20)
      } : null,
      scheduleList: petSchedules.length > 0 ? petSchedules : []
    });
  },

  // 切换Tab
  switchTab(e) {
    const url = e.currentTarget.dataset.url;
    wx.switchTab({ url });
  },

  // 日程详情
  openScheduleDetail(e) {
    const item = e.currentTarget.dataset.item;
    const id = item?.id || '';
    if (id) {
      wx.navigateTo({
        url: `/pages/schedule-detail/schedule-detail?id=${id}`
      });
    }
  },

  // 查看全部日程
  goToScheduleAll() {
    wx.showToast({ title: '查看全部日程', icon: 'none' });
  },

  // 去记录
  goToWriteLog() {
    wx.switchTab({ url: '/pages/record/record' });
  },

  // 查看日志详情
  goToLogDetail() {
    wx.navigateTo({ url: '/pages/ai-report/ai-report' });
  },

  // 跳转注册页
  goToRegister() {
    wx.reLaunch({ url: '/pages/register/register' });
  }
});