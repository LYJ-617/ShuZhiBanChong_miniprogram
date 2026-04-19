Page({
  data: {
    statusBarTop: 20,
    safeBottom: 20,
    feedbackTypes: [
      { id: 'bug', icon: '🐛', label: '功能异常' },
      { id: 'suggest', icon: '💡', label: '功能建议' },
      { id: 'content', icon: '📝', label: '内容问题' },
      { id: 'other', icon: '📋', label: '其他' }
    ],
    selectedType: 'suggest',
    content: '',
    contact: '',
    contentLength: 0
  },

  onLoad() {
    this.initSystemInfo();
  },

  initSystemInfo() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - ((sys.safeArea && sys.safeArea.bottom) || sys.screenHeight)) || 0) * 2;
    this.setData({ statusBarTop, safeBottom });
  },

  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ selectedType: type });
  },

  onContentInput(e) {
    const content = e.detail.value;
    this.setData({
      content,
      contentLength: content.length
    });
  },

  onContactInput(e) {
    this.setData({ contact: e.detail.value });
  },

  submitFeedback() {
    const { content, selectedType, contact } = this.data;

    if (!content.trim()) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' });
      return;
    }

    if (content.length < 10) {
      wx.showToast({ title: '反馈内容至少10个字', icon: 'none' });
      return;
    }

    // 模拟提交反馈
    wx.showLoading({ title: '提交中...' });

    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: '提交成功',
        content: '感谢您的反馈，我们会尽快处理！',
        showCancel: false,
        success: () => {
          // 返回上一页
          wx.navigateBack();
        }
      });
    }, 1000);
  },

  goToFAQ() {
    wx.navigateTo({
      url: '/pages/help-center/help-center'
    });
  },

  callService() {
    wx.makePhoneCall({
      phoneNumber: '4000000000',
      fail: () => {
        wx.showToast({ title: '拨打失败', icon: 'none' });
      }
    });
  }
});
