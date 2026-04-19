Page({
  data: {
    statusBarTop: 20,
    safeBottom: 20,
    notifications: {
      like: true,
      comment: true,
      consultReply: true,
      appointmentChange: true,
      scheduleReminder: true,
      couponPush: false
    }
  },

  onLoad() {
    this.initSystemInfo();
    this.loadSettings();
  },

  initSystemInfo() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - ((sys.safeArea && sys.safeArea.bottom) || sys.screenHeight)) || 0) * 2;
    this.setData({ statusBarTop, safeBottom });
  },

  loadSettings() {
    const notifications = wx.getStorageSync('notificationSettings');
    if (notifications) {
      this.setData({ notifications });
    }
  },

  toggleNotification(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    const notifications = this.data.notifications;
    notifications[key] = value;
    this.setData({ notifications });
    wx.setStorageSync('notificationSettings', notifications);
    
    wx.showToast({
      title: value ? '已开启' : '已关闭',
      icon: 'none',
      duration: 1500
    });
  }
});
