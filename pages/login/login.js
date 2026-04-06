Page({
  data: {
    isAgreed: false, // 是否同意协议
  },

  onLoad() {
    // 检查是否已经登录
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      // 已登录，跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  // 切换协议勾选状态
  toggleAgreement() {
    this.setData({
      isAgreed: !this.data.isAgreed
    });
  },

  // 处理获取手机号
  async handleGetPhoneNumber(e) {
    console.log('获取手机号返回:', e.detail);

    // 检查用户是否拒绝授权
    if (e.detail.errMsg === 'getPhoneNumber:fail user deny') {
      wx.showToast({
        title: '请授权手机号完成登录',
        icon: 'none'
      });
      return;
    }

    // 检查是否失败
    if (e.detail.errMsg && e.detail.errMsg.includes('fail')) {
      wx.showToast({
        title: '请授权手机号完成登录',
        icon: 'none'
      });
      return;
    }

    // 用户同意授权，获取手机号成功
    if (e.detail.encryptedData && e.detail.iv) {
      // 显示 loading
      wx.showLoading({
        title: '登录中...',
        mask: true
      });

      try {
        // 调用微信登录获取 code
        const loginResult = await this.wxLogin();

        // 将 encryptedData 和 iv 发送给后端解密
        // 这里由于是演示，我们直接使用模拟手机号
        // 实际项目中需要将 encryptedData 和 iv 发送给后端
        const phoneNumber = this.decryptPhoneNumber(e.detail.encryptedData, e.detail.iv, loginResult.code);

        if (phoneNumber) {
          // 后端登录
          const loginSuccess = await this.doLogin(phoneNumber);

          wx.hideLoading();

          if (loginSuccess) {
            wx.showToast({
              title: '登录成功',
              icon: 'success'
            });

            // 跳转到首页
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/index/index'
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
    } else {
      wx.showToast({
        title: '请授权手机号完成登录',
        icon: 'none'
      });
    }
  },

  // 微信登录获取 code
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

  // 解密手机号（模拟方法，实际需要后端处理）
  decryptPhoneNumber(encryptedData, iv, code) {
    // 模拟返回手机号
    // 实际项目中应该将 encryptedData、iv 和 code 发送给后端，由后端解密
    return '13800000000';
  },

  // 后端登录
  async doLogin(phoneNumber) {
    return new Promise((resolve) => {
      // 模拟后端登录
      // 实际项目中需要调用后端 API
      setTimeout(() => {
        // 生成用户信息
        const userInfo = {
          id: Date.now().toString(),
          username: '用户' + phoneNumber.slice(-4),
          phone: phoneNumber,
          avatar: '',
          createTime: new Date().toISOString()
        };

        // 保存用户信息
        wx.setStorageSync('userInfo', JSON.stringify(userInfo));
        wx.setStorageSync('userToken', 'mock_token_' + Date.now());

        resolve(true);
      }, 500);
    });
  }
});