Page({
  data: {
    cacheSize: '0 KB'
  },

  onLoad() {
    this.calculateCacheSize();
  },

  goToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  },

  goToAccount() {
    wx.showToast({
      title: '账号与安全功能开发中',
      icon: 'none'
    });
  },

  goToPrivacy() {
    wx.showToast({
      title: '隐私功能开发中',
      icon: 'none'
    });
  },

  goToNotification() {
    wx.showToast({
      title: '通知功能开发中',
      icon: 'none'
    });
  },

  goToGeneral() {
    wx.showToast({
      title: '通用设置功能开发中',
      icon: 'none'
    });
  },

  calculateCacheSize() {
    try {
      const res = wx.getStorageInfoSync();
      const sizeKB = (res.currentSize / 1024).toFixed(2);
      let sizeStr = sizeKB + ' KB';
      if (parseFloat(sizeKB) > 1024) {
        sizeStr = (parseFloat(sizeKB) / 1024).toFixed(2) + ' MB';
      }
      this.setData({
        cacheSize: sizeStr
      });
    } catch (e) {
      console.error('获取缓存大小失败', e);
    }
  },

  clearCache() {
    wx.showModal({
      title: '确认清除缓存',
      content: '清除后可以释放存储空间',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
            this.calculateCacheSize();
            wx.showToast({
              title: '缓存已清除',
              icon: 'success'
            });
          } catch (e) {
            wx.showToast({
              title: '清除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  goToAbout() {
    wx.showModal({
      title: '关于',
      content: '宠物日志小程序\n版本：1.0.0\n\n一个记录宠物生活的智能工具',
      showCancel: false,
      confirmText: '确定'
    });
  },

  logout() {
    wx.showModal({
      title: '确认退出登录？',
      content: '退出后将清除本地用户信息',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('petList');
          wx.removeStorageSync('petLogs');
          wx.redirectTo({
            url: '/pages/register/register'
          });
        }
      }
    });
  }
});
