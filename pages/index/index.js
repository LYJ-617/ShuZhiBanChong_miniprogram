const { getPetList, getPetLogs, getUserInfo } = require('../../utils/api.js');

Page({
  data: {
    reminders: [
      { id: '1', content: '乐乐的疫苗时间', time: '2026-03-01' },
      { id: '2', content: '喂鱼油', time: '每天' },
      { id: '3', content: '驱虫时间', time: '2026-02-20' }
    ],
    hasUnrecorded: false,
    username: '',
    petList: []
  },

  async onLoad() {
    const userInfo = await getUserInfo();
    if (userInfo) {
      this.setData({
        username: userInfo.username || '主人'
      });
    }

    const petList = await getPetList();
    this.setData({ petList });
    
    if (petList.length > 0) {
      const logs = await getPetLogs();
      const today = new Date().toDateString();
      const hasTodayLog = logs.some((log) => {
        const logDate = new Date(log.createTime).toDateString();
        return logDate === today;
      });
      this.setData({
        hasUnrecorded: !hasTodayLog
      });
    }
  },

  onShow() {
    // 每次显示刷新宠物数据
    this.refreshData();
  },

  async refreshData() {
    const userInfo = await getUserInfo();
    if (userInfo) {
      this.setData({
        username: userInfo.username || '主人'
      });
    }
    
    const petList = await getPetList();
    this.setData({ petList });
    
    if (petList.length > 0) {
      const logs = await getPetLogs();
      const today = new Date().toDateString();
      const hasTodayLog = logs.some((log) => {
        const logDate = new Date(log.createTime).toDateString();
        return logDate === today;
      });
      this.setData({
        hasUnrecorded: !hasTodayLog
      });
    }
  },

  goToLog() {
    wx.switchTab({
      url: '/pages/log/log'
    });
  },

  goToCommunity() {
    wx.switchTab({
      url: '/pages/community/community'
    });
  },

  goToService() {
    wx.switchTab({
      url: '/pages/service/service'
    });
  },

  goToMine() {
    wx.switchTab({
      url: '/pages/mine/mine'
    });
  },

  goToAiReport() {
    wx.navigateTo({
      url: '/pages/ai-report/ai-report'
    });
  },

  viewReminderDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '查看日程详情',
      icon: 'none'
    });
  },

  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  },

  goToPetList() {
    wx.navigateTo({
      url: '/pages/pet-list/pet-list'
    });
  }
});