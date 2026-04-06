Page({
  data: {
    userInfo: null,
    petCount: 0,
    hasUnreadComment: false,
    hasUnreadOrder: false,
    hasUnreadAppointment: false,
    hasUnreadConsult: false,
    menuGroups: []
  },

  onLoad() {
    this.loadUserInfo();
    this.loadPetCount();
  },

  onShow() {
    this.loadUserInfo();
    this.loadPetCount();
    this.checkUnreadStatus();
  },

  loadUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        const phone = userInfo.phone || '';
        const maskedPhone = phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定手机';
        this.setData({
          userInfo: {
            ...userInfo,
            maskedPhone: maskedPhone
          }
        });
      } else {
        this.setData({ userInfo: null });
      }
    } catch (e) {
      console.error('获取用户信息失败', e);
    }
  },

  loadPetCount() {
    try {
      const petList = wx.getStorageSync('petList') || [];
      this.setData({ petCount: petList.length });
    } catch (e) {
      console.error('获取宠物数量失败', e);
    }
  },

  checkUnreadStatus() {
    // 检查未读状态
    const commentList = wx.getStorageSync('commentList') || [];
    const orderList = wx.getStorageSync('orderList') || [];
    const appointmentList = wx.getStorageSync('appointmentList') || [];
    const consultList = wx.getStorageSync('consultList') || [];

    const hasUnreadComment = commentList.some(item => item.isReplied === false);
    const hasUnreadOrder = orderList.some(item => item.status === 'pending_payment');
    const hasUnreadAppointment = appointmentList.some(item => item.status === 'pending_confirm');
    const hasUnreadConsult = consultList.some(item => item.status === 'pending_reply');

    this.setData({
      hasUnreadComment,
      hasUnreadOrder,
      hasUnreadAppointment,
      hasUnreadConsult
    });
  },

  goToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  chooseAvatar() {
    if (!this.data.userInfo) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.saveAvatar(tempFilePath);
      }
    });
  },

  saveAvatar(tempFilePath) {
    let userInfo = this.data.userInfo || {};
    userInfo = { ...userInfo, avatarUrl: tempFilePath };
    this.setData({ userInfo });
    wx.setStorageSync('userInfo', userInfo);
    wx.showToast({ title: '头像设置成功', icon: 'success' });
  },

  handleMenuTap(e) {
    const url = e.currentTarget.dataset.url;
    const type = e.currentTarget.dataset.type;
    if (!this.data.userInfo) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    if (type === 'agreement') {
      wx.navigateTo({ url: '/pages/agreement/agreement' });
    } else if (url) {
      wx.navigateTo({ url });
    }
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？退出后将清除本地登录信息',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({ title: '退出成功', icon: 'success' });
          setTimeout(() => {
            wx.redirectTo({ url: '/pages/login/login' });
          }, 1000);
        }
      }
    });
  }
});