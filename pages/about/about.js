Page({
  data: {
    statusBarTop: 20,
    safeBottom: 20,
    version: '1.0.0'
  },

  onLoad() {
    this.initSystemInfo();
  },

  initSystemInfo() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - ((sys.safeArea && sys.safeArea.bottom) || sys.screenHeight)) || 0) * 2;
    this.setData({ statusBarTop, safeBottom });
  },

  checkUpdate() {
    wx.showToast({
      title: '已是最新版本',
      icon: 'success',
      duration: 2000
    });
  }
});
