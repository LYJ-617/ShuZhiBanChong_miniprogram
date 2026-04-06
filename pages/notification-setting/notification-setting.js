Page({
  data: {
    notifications: {
      like: true,
      comment: true,
      consultReply: true,
      appointmentChange: true,
      scheduleReminder: true,
      couponPush: true
    }
  },

  onLoad() {
    this.loadSettings();
  },

  loadSettings() {
    const settings = wx.getStorageSync('notificationSettings');
    if (settings) {
      this.setData({ notifications: settings });
    }
  },

  toggleNotification(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    const notifications = this.data.notifications;
    notifications[key] = value;
    this.setData({ notifications });
    wx.setStorageSync('notificationSettings', notifications);

    if (!value) {
      wx.showModal({
        title: '提示',
        content: '关闭后您将不再接收该类通知',
        showCancel: false
      });
    }
  }
});