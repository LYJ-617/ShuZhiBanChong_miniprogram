import { getPetLogs, getPetList, getUserInfo } from '../../utils/api.js';

Page({
  data: {
    reminders: [
      { id: '1', content: '乐乐的疫苗时间', time: '2026-03-01' },
      { id: '2', content: '喂鱼油', time: '每天' },
      { id: '3', content: '驱虫时间', time: '2026-02-20' }
    ],
    hasUnrecorded: false,
    username: ''
  },

  async onLoad() {
    const userInfo = await getUserInfo();
    if (userInfo) {
      this.setData({
        username: userInfo.username
      });
    }

    const petList = await getPetList();
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
    wx.switchTab({
      url: '/pages/service/service'
    });
  }
});
