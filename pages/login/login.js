Page({
  data: {
    isAgreed: false,
  },

  toggleAgreement(e) {
    const isAgreed = e.detail.value && e.detail.value.length > 0;
    this.setData({
      isAgreed: isAgreed
    });
  },

  // 模拟登录（开发测试用）
  async testLogin() {
    if (!this.data.isAgreed) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    try {
      const phoneNumber = '138' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

      const userInfo = {
        id: Date.now().toString(),
        username: '用户' + phoneNumber.slice(-4),
        phone: phoneNumber,
        avatar: '',
        createTime: new Date().toISOString(),
        isRegister: false  // 未注册标记
      };

      wx.setStorageSync('userInfo', userInfo);
      wx.setStorageSync('userToken', 'mock_token_' + Date.now());

      wx.hideLoading();

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/register/register'
        });
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      console.error('登录失败:', error);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    }
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
      await this.testLogin();
      return;
    }

    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    try {
      await this.wxLogin();

      const phoneNumber = '138' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

      if (phoneNumber) {
        const loginSuccess = await this.doLogin(phoneNumber);

        wx.hideLoading();

        if (loginSuccess) {
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });

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
          createTime: new Date().toISOString(),
          isRegister: false
        };

        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('userToken', 'mock_token_' + Date.now());

        resolve(true);
      }, 500);
    });
  }
});