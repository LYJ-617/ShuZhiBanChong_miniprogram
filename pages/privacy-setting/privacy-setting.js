Page({
  data: {
    statusBarTop: 20,
    safeBottom: 20,
    
    // 账户可见性设置
    visibility: 'public',  // public | friends | private
    
    // 活动记录隐藏设置
    activityHidden: {
      post: false,
      like: false,
      comment: false,
      pet: false
    },
    
    // 夜间模式
    nightMode: false,
    
    // 弹窗状态
    showAuthModal: false,
    showExportModal: false,
    showDeleteModal: false,
    showToast: false,
    toastMessage: '',
    toastType: 'success',
    
    // 当前查看的应用
    currentApp: {
      name: '',
      authorized: false,
      hasProfile: false,
      hasPhone: false,
      hasLocation: false
    }
  },

  onLoad() {
    this.initSystemInfo();
    this.loadPrivacySettings();
    this.loadThemeSetting();
  },

  onShow() {
    this.checkSystemTheme();
  },

  onReady() {
    wx.hideShareMenu();
  },

  initSystemInfo() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - ((sys.safeArea && sys.safeArea.bottom) || sys.screenHeight)) || 0) * 2;
    this.setData({ statusBarTop, safeBottom });
  },

  // 检查系统夜间模式
  checkSystemTheme() {
    const nightMode = wx.getStorageSync('nightMode');
    if (nightMode !== undefined) {
      this.setData({ nightMode });
    }
  },

  // 加载隐私设置
  loadPrivacySettings() {
    const privacySettings = wx.getStorageSync('privacySettings') || {};
    this.setData({
      visibility: privacySettings.visibility || 'public',
      activityHidden: privacySettings.activityHidden || {
        post: false,
        like: false,
        comment: false,
        pet: false
      }
    });
  },

  // 保存隐私设置
  savePrivacySettings() {
    const { visibility, activityHidden } = this.data;
    wx.setStorageSync('privacySettings', { visibility, activityHidden });
  },

  // 加载主题设置
  loadThemeSetting() {
    const nightMode = wx.getStorageSync('nightMode') || false;
    this.setData({ nightMode });
  },

  // ============ 可见性设置 ============
  setVisibility(e) {
    const visibility = e.currentTarget.dataset.value;
    if (this.data.visibility === visibility) return;
    
    this.setData({ visibility });
    this.savePrivacySettings();
    this.showToast('可见性已更新', 'success');
  },

  // ============ 活动记录隐藏 ============
  toggleActivity(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    
    const activityHidden = { ...this.data.activityHidden };
    activityHidden[key] = value;
    
    this.setData({ activityHidden });
    this.savePrivacySettings();
    
    const statusText = value ? '已隐藏' : '已显示';
    const itemNames = { post: '帖子', like: '点赞', comment: '评论', pet: '宠物信息' };
    this.showToast(`${itemNames[key]}${statusText}`, 'success');
  },

  // ============ 第三方授权 ============
  showAuthDetail(e) {
    const appType = e.currentTarget.dataset.app;
    const apps = {
      wechat: {
        name: '微信',
        authorized: true,
        hasProfile: true,
        hasPhone: true,
        hasLocation: true
      },
      alipay: {
        name: '支付宝',
        authorized: false,
        hasProfile: false,
        hasPhone: false,
        hasLocation: false
      },
      apple: {
        name: 'Apple ID',
        authorized: false,
        hasProfile: false,
        hasPhone: false,
        hasLocation: false
      }
    };
    
    this.setData({
      currentApp: apps[appType] || apps.wechat,
      showAuthModal: true
    });
  },

  closeAuthModal() {
    this.setData({ showAuthModal: false });
  },

  revokeAuth() {
    wx.showModal({
      title: '解除授权',
      content: '确定要解除该应用的授权吗？解除后该应用将无法访问您的数据',
      confirmText: '解除',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 模拟解除授权
          const currentApp = { ...this.data.currentApp };
          currentApp.authorized = false;
          currentApp.hasProfile = false;
          currentApp.hasPhone = false;
          currentApp.hasLocation = false;
          this.setData({ currentApp, showAuthModal: false });
          this.showToast('已解除授权', 'success');
        }
      }
    });
  },

  // ============ 数据导出 ============
  exportData() {
    this.setData({ showExportModal: true });
  },

  closeExportModal() {
    this.setData({ showExportModal: false });
  },

  confirmExport() {
    this.closeExportModal();
    wx.showLoading({ title: '正在导出...' });
    
    // 模拟导出过程
    setTimeout(() => {
      wx.hideLoading();
      
      // 准备导出数据
      const userInfo = wx.getStorageSync('userInfo') || {};
      const petList = wx.getStorageSync('petList') || [];
      const logList = wx.getStorageSync('logList') || [];
      const postList = wx.getStorageSync('postList') || [];
      
      const exportData = {
        exportTime: new Date().toISOString(),
        userInfo: {
          nickname: userInfo.nickname || '',
          phone: userInfo.phone || '',
          createTime: userInfo.createTime || ''
        },
        petList: petList,
        logList: logList,
        postList: postList
      };
      
      // 生成JSON文件并保存
      const fileName = `pet_data_${Date.now()}.json`;
      const fileContent = JSON.stringify(exportData, null, 2);
      
      // 实际项目中应该调用文件保存API
      wx.showToast({
        title: '数据导出成功',
        icon: 'success',
        duration: 2000
      });
      
      // 提示用户查看
      wx.showModal({
        title: '导出成功',
        content: `数据已导出到文件：${fileName}\n可在「文件管理」中查看`,
        showCancel: false,
        confirmText: '知道了'
      });
    }, 1500);
  },

  // ============ 数据删除 ============
  showDeleteConfirm() {
    this.setData({ showDeleteModal: true });
  },

  closeDeleteModal() {
    this.setData({ showDeleteModal: false });
  },

  confirmDelete() {
    this.closeDeleteModal();
    
    // 二次确认
    wx.showModal({
      title: '再次确认',
      content: '您确定要删除所有账户数据吗？此操作不可撤销！',
      confirmText: '彻底删除',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 模拟删除
          wx.showLoading({ title: '正在删除...' });
          
          setTimeout(() => {
            wx.hideLoading();
            
            // 清除所有本地数据
            wx.clearStorageSync();
            
            this.showToast('数据已全部删除', 'success');
            
            // 跳转到登录页
            setTimeout(() => {
              wx.reLaunch({ url: '/pages/login/login' });
            }, 1500);
          }, 1000);
        }
      }
    });
  },

  // ============ 夜间模式 ============
  toggleNightMode(e) {
    const nightMode = e.detail.value;
    this.setData({ nightMode });
    wx.setStorageSync('nightMode', nightMode);
    
    // 通知页面更新主题
    const pages = getCurrentPages();
    if (pages.length > 0) {
      pages.forEach(page => {
        if (page.onThemeChange) {
          page.onThemeChange(nightMode);
        }
      });
    }
    
    this.showToast(nightMode ? '已开启夜间模式' : '已关闭夜间模式', 'success');
  },

  // ============ Toast提示 ============
  showToast(message, type = 'success') {
    this.setData({
      showToast: true,
      toastMessage: message,
      toastType: type
    });
    
    setTimeout(() => {
      this.setData({ showToast: false });
    }, 2000);
  },

  // 阻止事件冒泡
  preventBubble() {}
});
