// pages/login/login.ts
Page({
  /**
   * 页面初始数据
   */
  data: {
    isAgree: false, // 协议勾选状态，默认未勾选，未勾选无法登录
  },

  /**
   * 协议勾选状态切换
   */
  toggleAgree(e: WechatMiniprogram.CheckboxGroupChange) {
    const isChecked = e.detail.value.includes('agree');
    this.setData({
      isAgree: isChecked
    });
  },

  /**
   * 跳转隐私政策（后续可替换为正式协议页面）
   */
  goToPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '这里为数智伴宠隐私政策完整内容，后续可替换为富文本/webview页面',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 跳转用户协议（后续可替换为正式协议页面）
   */
  goToAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '这里为数智伴宠用户协议完整内容，后续可替换为富文本/webview页面',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 微信手机号授权核心登录逻辑（符合微信最新规范）
   */
  async getPhoneNumber(e: WechatMiniprogram.GetPhoneNumberEvent) {
    // 1. 判断用户是否拒绝授权
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({
        title: '您拒绝了手机号授权，无法登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 2. 获取手机号解密code（需传给后端）
    const phoneCode = e.detail.code;
    console.log('手机号授权code：', phoneCode);

    try {
      // 3. 获取用户登录凭证code（用于后端获取openid/session_key）
      const loginRes = await wx.login();
      if (loginRes.errMsg !== 'login:ok') {
        throw new Error('获取登录凭证失败');
      }
      const loginCode = loginRes.code;
      console.log('用户登录code：', loginCode);

      // --------------------------
      // 【后端对接区】
      // 需将 phoneCode + loginCode 传给你的后端接口
      // 后端通过微信官方接口解密获取真实手机号，完成用户注册/登录
      // 登录成功后，后端返回用户token，存储到本地缓存
      // --------------------------
      
      // 测试模拟登录（上线替换为真实接口请求）
      wx.showLoading({
        title: '登录中...',
        mask: true
      });
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 登录成功，存储登录状态
      wx.setStorageSync('userToken', 'your_backend_token');
      wx.setStorageSync('isLogin', true);

      wx.hideLoading();
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1000
      });

      // 4. 登录成功，跳转到宠物信息注册页
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/petRegister/petRegister'
        });
      }, 1000);

    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none',
        duration: 2000
      });
      console.error('登录异常：', error);
    }
  },

  /**
   * 页面加载时判断登录状态，已登录直接跳首页
   */
  onLoad() {
    const isLogin = wx.getStorageSync('isLogin');
    const hasRegisterPet = wx.getStorageSync('hasRegisterPet');
    if (isLogin && hasRegisterPet) {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },
})