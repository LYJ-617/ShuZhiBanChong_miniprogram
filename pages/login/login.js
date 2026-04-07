Page({
  data: {
    isAgreed: false,
  },

  onLoad() {
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      // 已登录，检查是否有宠物
      const petList = wx.getStorageSync('petList');
      if (petList && petList.length > 0) {
        // 有宠物，跳转到首页
        wx.switchTab({
          url: '/pages/index/index'
        });
      } else {
        // 没有宠物，跳转到注册页
        wx.redirectTo({
          url: '/pages/register/register'
        });
      }
    }
  },

  toggleAgreement() {
    this.setData({
      isAgreed: !this.data.isAgreed
    });
  },

  async handleGetPhoneNumber(e) {
    console.log('获取手机号返回:', e.detail);

    if (e.detail.errMsg === 'getPhoneNumber:fail user deny') {
      wx.showToast({
        title: '请授权手机号完成登录',
        icon: 'none'
      });
      return;
    }

    if (e.detail.errMsg && e.detail.errMsg.includes('fail')) {
      wx.showToast({
        title: '请授权手机号完成登录',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    try {
      const loginResult = await this.wxLogin();
      
      // 模拟返回手机号
      const phoneNumber = '138' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      if (phoneNumber) {
        const loginSuccess = await this.doLogin(phoneNumber);

        wx.hideLoading();

        if (loginSuccess) {
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });

          // 跳转到宠物注册页
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/register/register'
            });
          }, 1500);
        }
      }
    } catch (error) {
      wx.hideLoading();
      console.error('登录失败:', error);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    }
  },

  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve({ code: res.code });
          } else {
            reject(new Error('微信登录失败'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  async doLogin(phoneNumber) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userInfo = {
          id: Date.now().toString(),
          username: '用户' + phoneNumber.slice(-4),
          phone: phoneNumber,
          avatar: '',
          createTime: new Date().toISOString()
        };

        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('userToken', 'mock_token_' + Date.now());

        resolve(true);
      }, 500);
    });
  }
});