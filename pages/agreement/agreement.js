Page({
  data: {
    agreementList: [
      { title: '用户协议', url: 'https://example.com/user-agreement' },
      { title: '隐私政策', url: 'https://example.com/privacy-policy' }
    ]
  },

  onLoad() {},

  openAgreement(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(url)}`
    });
  }
});