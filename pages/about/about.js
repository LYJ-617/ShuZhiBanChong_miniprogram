Page({
  data: {
    version: '1.0.0'
  },

  onLoad() {
    this.checkUpdate();
  },

  checkUpdate() {
    const version = wx.getSystemInfoSync();
    this.setData({ version: version.version });
  }
});