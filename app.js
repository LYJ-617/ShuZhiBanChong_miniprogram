App({
  globalData: {
    userInfo: null,
    petList: [],
    ui: {
      statusBarTop: 20,
      safeBottom: 0
    }
  },

  onLaunch() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - ((sys.safeArea && sys.safeArea.bottom) || sys.screenHeight)) || 0) * 2;
    this.globalData.ui = {
      statusBarTop,
      safeBottom
    };
    this.checkLoginStatus();
  },

  // 检查登录态并跳转
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const storagePetList = wx.getStorageSync('petList');
    const petList = Array.isArray(storagePetList)
      ? storagePetList
      : (Array.isArray(userInfo?.petList) ? userInfo.petList : []);

    this.globalData.userInfo = userInfo || null;
    this.globalData.petList = petList;

    // 优先级1：本地storage有userInfo且含至少1只宠物数据 -> 首页
    if (userInfo && Array.isArray(petList) && petList.length > 0) {
      wx.switchTab({
        url: '/pages/index/index'
      });
      return;
    }

    // 优先级2：本地有userInfo但无宠物数据 -> 宠物注册页
    if (userInfo) {
      wx.reLaunch({
        url: '/pages/register/register'
      });
      return;
    }

    // 优先级3：无userInfo -> 登录页
    wx.reLaunch({
      url: '/pages/login/login'
    });
  }
});