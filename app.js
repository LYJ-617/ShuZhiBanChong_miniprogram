App({
  globalData: {
    userInfo: null,
    petList: []
  },
  onLaunch() {
    // 检查是否有用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      // 未登录，跳转到登录页
      wx.redirectTo({
        url: '/pages/login/login'
      });
    } else {
      // 已登录，加载宠物列表
      const petList = wx.getStorageSync('petList');
      this.globalData.userInfo = userInfo;
      this.globalData.petList = petList || [];
    }
  },
  
  onShow() {
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
  }
});