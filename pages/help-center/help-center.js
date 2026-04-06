Page({
  data: {
    searchQuery: '',
    faqList: [
      { category: '账号问题', questions: [
        { q: '如何绑定手机号？', a: '通过登录页的微信手机号授权即可绑定。' },
        { q: '如何更换手机号？', a: '在「账号与安全」中更换，需重新授权。' },
        { q: '账号如何注销？', a: '在「账号与安全」中申请，有7天冷静期。' }
      ]},
      { category: '日志功能', questions: [
        { q: '如何发布日志？', a: '在日志页点击「+」按钮创建。' },
        { q: '日志如何设置为私人？', a: '发布时可选择「私人」可见性。' }
      ]},
      { category: 'AI 分析', questions: [
        { q: 'AI 分析准吗？', a: '基于大数据分析，仅供参考。' },
        { q: '如何查看分析报告？', a: '在宠物详情页查看专属报告。' }
      ]},
      { category: '订单售后', questions: [
        { q: '如何申请售后？', a: '在订单详情页点击「申请售后」。' },
        { q: '退款多久到账？', a: '退款将在1-7个工作日内原路返回。' }
      ]},
      { category: '预约问诊', questions: [
        { q: '如何预约服务？', a: '在服务页选择商家和服务项目进行预约。' },
        { q: '如何取消预约？', a: '在预约详情页可取消预约。' }
      ]}
    ]
  },

  onLoad() {},

  onSearch(e) {
    this.setData({ searchQuery: e.detail.value });
  },

  contactCustomerService() {
    wx.openCustomerServiceConversation({
      fail: () => {
        wx.showToast({ title: '客服忙碌中，请稍后重试', icon: 'none' });
      }
    });
  },

  goToFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' });
  }
});