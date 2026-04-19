Page({
  data: {
    statusBarTop: 20,
    safeBottom: 20,
    userInfo: null,
    phone: '',
    hasWechat: false,
    isBinding: false,
    showUnbindModal: false,
    showSyncTip: false,
    showSuccessToast: false,
    showErrorModal: false,
    toastMessage: '',
    errorInfo: {
      code: '',
      message: ''
    },
    wechatInfo: {
      openId: '',
      unionId: '',
      nickname: '',
      avatarUrl: '',
      bindTime: ''
    }
  },

  onLoad() {
    this.initSystemInfo();
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  onReady() {
    // 隐藏转发按钮
    wx.hideShareMenu();
  },

  initSystemInfo() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - ((sys.safeArea && sys.safeArea.bottom) || sys.screenHeight)) || 0) * 2;
    this.setData({ statusBarTop, safeBottom });
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      const phone = userInfo.phone || '';
      const maskedPhone = phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定';
      const hasWechat = !!(userInfo.wechatId);
      
      // 加载微信绑定信息
      let wechatInfo = this.data.wechatInfo;
      if (userInfo.wechatInfo) {
        wechatInfo = {
          openId: userInfo.wechatInfo.openId || '',
          unionId: userInfo.wechatInfo.unionId || '',
          nickname: userInfo.wechatInfo.nickname || '',
          avatarUrl: userInfo.wechatInfo.avatarUrl || '',
          bindTime: userInfo.wechatInfo.bindTime || this.formatDate(new Date())
        };
      }
      
      this.setData({ userInfo, phone: maskedPhone, hasWechat, wechatInfo });
    }
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 更换手机号
  changePhone() {
    wx.showModal({
      title: '更换手机号',
      content: '需要重新授权微信手机号',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/login/login' });
        }
      }
    });
  },

  // 绑定微信 - 三步完成
  bindWechat() {
    if (this.data.isBinding) return;
    
    this.setData({ isBinding: true });

    // 步骤1: 获取微信登录凭证
    wx.login({
      provider: 'weixin',
      success: (loginRes) => {
        if (!loginRes.code) {
          this.handleBindError({ code: 'LOGIN_FAILED', message: '获取登录凭证失败' });
          return;
        }

        // 步骤2: 获取用户信息（头像、昵称）
        this.getUserProfile(loginRes.code);
      },
      fail: (err) => {
        this.handleBindError({ code: 'LOGIN_FAILED', message: err.errMsg || '微信登录失败' });
      }
    });
  },

  // 获取用户信息
  getUserProfile(code) {
    // 使用 button 组件的 open-type="chooseAvatar" 获取用户头像
    // 这里模拟获取用户信息
    const userInfo = {
      nickname: '微信用户',
      avatarUrl: ''
    };

    // 实际项目中应该调用后端接口
    this.completeBind(code, userInfo);
  },

  // 完成绑定流程
  completeBind(code, wechatUserInfo) {
    // 模拟后端接口调用
    const mockApiBind = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // 模拟成功
          resolve({
            success: true,
            data: {
              openId: 'mock_openid_' + Date.now(),
              unionId: 'mock_unionid_' + Date.now()
            }
          });
        }, 800);
      });
    };

    mockApiBind().then(res => {
      if (res.success) {
        // 保存绑定信息到本地
        const userInfo = this.data.userInfo || {};
        userInfo.wechatId = res.data.openId;
        userInfo.wechatInfo = {
          openId: res.data.openId,
          unionId: res.data.unionId,
          nickname: wechatUserInfo.nickname,
          avatarUrl: wechatUserInfo.avatarUrl,
          bindTime: this.formatDate(new Date())
        };
        wx.setStorageSync('userInfo', userInfo);

        // 更新状态
        this.setData({
          isBinding: false,
          hasWechat: true,
          wechatInfo: userInfo.wechatInfo,
          showSyncTip: true
        });

        // 显示成功提示
        this.showToast('绑定成功，头像和昵称已同步');

        // 3秒后隐藏同步提示
        setTimeout(() => {
          this.setData({ showSyncTip: false });
        }, 3000);
      }
    }).catch(err => {
      this.handleBindError({ code: 'API_ERROR', message: '绑定失败，请重试' });
    });
  },

  // 处理绑定错误
  handleBindError(error) {
    console.error('微信绑定失败:', error);
    this.setData({ 
      isBinding: false,
      errorInfo: error,
      showErrorModal: true
    });
  },

  // 同步微信信息
  syncWechatInfo() {
    wx.showLoading({ title: '同步中...' });

    // 模拟同步请求
    setTimeout(() => {
      wx.hideLoading();
      
      // 实际应该调用微信API重新获取用户信息
      const userInfo = this.data.userInfo || {};
      if (userInfo.wechatInfo) {
        userInfo.wechatInfo.avatarUrl = userInfo.wechatInfo.avatarUrl;
        userInfo.wechatInfo.nickname = userInfo.wechatInfo.nickname || '微信用户';
        wx.setStorageSync('userInfo', userInfo);
        this.setData({ wechatInfo: userInfo.wechatInfo });
      }
      
      this.showToast('信息已更新');
    }, 1000);
  },

  // 解绑微信
  unbindWechat() {
    this.setData({ showUnbindModal: true });
  },

  // 关闭解绑弹窗
  closeUnbindModal() {
    this.setData({ showUnbindModal: false });
  },

  // 确认解绑
  confirmUnbind() {
    this.closeUnbindModal();
    wx.showLoading({ title: '解绑中...' });

    // 模拟解绑请求
    setTimeout(() => {
      wx.hideLoading();
      
      // 清除微信绑定信息
      const userInfo = this.data.userInfo || {};
      delete userInfo.wechatId;
      delete userInfo.wechatInfo;
      wx.setStorageSync('userInfo', userInfo);

      // 重置状态
      this.setData({
        hasWechat: false,
        wechatInfo: {
          openId: '',
          unionId: '',
          nickname: '',
          avatarUrl: '',
          bindTime: ''
        }
      });

      this.showToast('已解除微信绑定');
    }, 800);
  },

  // 账号注销
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
  },

  // 显示成功提示
  showToast(message) {
    this.setData({
      showSuccessToast: true,
      toastMessage: message
    });

    setTimeout(() => {
      this.setData({ showSuccessToast: false });
    }, 2000);
  },

  // 关闭错误弹窗
  closeErrorModal() {
    this.setData({ showErrorModal: false });
  },

  // 阻止事件冒泡
  preventBubble() {}
});
