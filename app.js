App({
  globalData: {
    userInfo: null,
    petList: []
  },

  onLaunch() {
    console.log('App onLaunch');
    
    // 从本地存储读取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    const petList = wx.getStorageSync('petList') || [];
    
    console.log('onLaunch - userInfo:', userInfo);
    console.log('onLaunch - petList:', petList);
    
    // 核心判断逻辑（优先级从高到低）
    if (userInfo && userInfo.isRegister) {
      // 情况1：已经注册完成 → 直接进首页
      console.log('已注册，直接进首页');
      this.globalData.userInfo = userInfo;
      this.globalData.petList = petList;
      wx.switchTab({
        url: '/pages/index/index'
      });
    } else if (userInfo && !userInfo.isRegister) {
      // 情况2：有用户信息但没完成注册 → 进注册页
      console.log('有用户但未注册，进注册页');
      this.globalData.userInfo = userInfo;
      this.globalData.petList = petList;
      wx.redirectTo({
        url: '/pages/register/register'
      });
    } else {
      // 情况3：完全没登录 → 进登录页
      console.log('未登录，进登录页');
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
  }
});