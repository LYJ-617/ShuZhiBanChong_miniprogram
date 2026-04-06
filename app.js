App({
  globalData: {
    userInfo: null,
    petList: []
  },
  onLaunch() {
    const userInfo = wx.getStorageSync('userInfo');
    const petList = wx.getStorageSync('petList');
    if (userInfo && petList) {
      this.globalData.userInfo = JSON.parse(userInfo);
      this.globalData.petList = JSON.parse(petList);
    } else {
      wx.redirectTo({
        url: '/pages/register/register'
      });
    }
  }
});
