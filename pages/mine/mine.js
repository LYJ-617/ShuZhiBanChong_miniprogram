Page({
  data: {
    statusBarTop: 20,
    safeBottom: 20,
    userInfo: null,
    petCount: 0,
    hasUnreadComment: false,
    hasUnreadOrder: false,
    hasUnreadAppointment: false,
    hasUnreadConsult: false,
    menuGroups: []
  },

  onLoad() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - ((sys.safeArea && sys.safeArea.bottom) || sys.screenHeight)) || 0) * 2;
    this.setData({ statusBarTop, safeBottom });
    this.loadUserInfo();
    this.loadPetCount();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 });
    }
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
  },

  // ============ 内容与互动模块跳转 ============
  // 我的社区帖子
  goToMyPosts() {
    if (!this.data.userInfo) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    wx.navigateTo({
      url: '/pages/my-posts/my-posts'
    });
  },

  // 我的点赞
  goToMyLikes() {
    if (!this.data.userInfo) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    wx.navigateTo({
      url: '/pages/my-likes/my-likes'
    });
  },

  // 我的评论
  goToMyComments() {
    if (!this.data.userInfo) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    wx.navigateTo({
      url: '/pages/my-comments/my-comments'
    });
  },

  // ============ 宠物管理 ============
  onPetTap(e) {
    const petId = e.currentTarget.dataset.petId;
    const petList = wx.getStorageSync('petList') || [];
    const pet = petList.find(p => p.id === petId);
    if (pet) {
      this.setData({ currentPet: pet, petActionVisible: true });
    }
  },

  addPet() {
    wx.navigateTo({
      url: '/pages/pet-add/pet-add'
    });
  },

  closePetAction() {
    this.setData({ petActionVisible: false });
  },

  noop() {},

  switchPet() {
    wx.showToast({ title: '切换成功', icon: 'success' });
    this.closePetAction();
  },

  editPet() {
    if (this.data.currentPet) {
      wx.navigateTo({
        url: `/pages/pet-edit/pet-edit?petId=${this.data.currentPet.id}`
      });
    }
    this.closePetAction();
  },

  deletePet() {
    const pet = this.data.currentPet;
    if (!pet) return;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除宠物"${pet.petName}"吗？`,
      confirmText: '删除',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          try {
            const petList = wx.getStorageSync('petList') || [];
            const filtered = petList.filter(p => p.id !== pet.id);
            wx.setStorageSync('petList', filtered);
            this.loadPetCount();
            wx.showToast({ title: '删除成功', icon: 'success' });
          } catch (e) {
            console.error('删除宠物失败', e);
          }
        }
        this.closePetAction();
      }
    });
  },

  goToProfileEdit() {
    wx.navigateTo({
      url: '/pages/profile-edit/profile-edit'
    });
  },

  goToPhoneBind() {
    wx.navigateTo({
      url: '/pages/profile-edit/profile-edit'
    });
  },

  // ============ 设置与服务模块跳转 ============
  goToAccountSecurity() {
    wx.navigateTo({
      url: '/pages/account-security/account-security'
    });
  },

  goToPrivacy() {
    wx.navigateTo({
      url: '/pages/privacy-setting/privacy-setting'
    });
  },

  goToGeneralSetting() {
    wx.navigateTo({
      url: '/pages/setting/setting'
    });
  },

  goToAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    });
  },

  goToFeedback() {
    if (!this.data.userInfo) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  },

  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-xxx-xxxx\n工作时间：9:00-21:00',
      confirmText: '拨打',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '4000000000',
            fail: () => {
              wx.showToast({ title: '拨打失败', icon: 'none' });
            }
          });
        }
      }
    });
  }
});