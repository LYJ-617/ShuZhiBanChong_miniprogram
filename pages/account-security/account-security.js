Page({
  data: {
    userInfo: null,
    phone: ''
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      const phone = userInfo.phone || '';
      const maskedPhone = phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定';
      this.setData({ userInfo, phone: maskedPhone });
    }
  },

  changePhone() {
    wx.showModal({
      title: '更换手机号',
      content: '需要重新授权微信手机号',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/login/login' });
        }
      }
    });
  },

  accountCancellation() {
    wx.showModal({
      title: '账号注销',
      content: '账号注销后，所有用户数据、宠物信息、日志、订单将永久清除，无法恢复。确定要注销吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '冷静期提示',
            content: '注销申请已提交，请在7天内确认。确认后账号将被永久注销。',
            confirmText: '知道了',
            showCancel: false,
            success: () => {
              wx.setStorageSync('cancellationRequested', true);
            }
          });
        }
      }
    });
  }
});