Page({
  data: {
    statusBarTop: 20,
    safeBottom: 20,
    expandedId: null,
    faqList: [
      {
        id: 1,
        question: '如何添加宠物？',
        answer: '在"我的"页面点击"添加宠物"按钮，进入宠物信息填写页面，填写宠物名称、种类、性别、出生日期等信息即可添加。'
      },
      {
        id: 2,
        question: '如何发布帖子到社区？',
        answer: '在"社区"页面点击右下角的"+"按钮，可以发布图文帖子。选择封面图、填写内容后点击发布即可。'
      },
      {
        id: 3,
        question: '如何设置日程提醒？',
        answer: '在"记录"页面点击"添加日程"按钮，选择日期、时间和提醒内容，可以设置疫苗提醒、体检提醒、驱虫提醒等多种类型。'
      },
      {
        id: 4,
        question: '如何联系在线问诊医生？',
        answer: '在"服务"页面点击"在线问诊"，选择宠物类型和问题描述，系统会为您匹配专业宠物医生进行解答。'
      },
      {
        id: 5,
        question: '忘记登录密码怎么办？',
        answer: '在登录页面点击"忘记密码"，通过绑定的手机号验证后即可重置密码。'
      },
      {
        id: 6,
        question: '如何删除已发布的内容？',
        answer: '进入"我的"->"我的帖子"，点击想要删除的帖子右上角的"..."按钮，选择删除即可。'
      },
      {
        id: 7,
        question: '如何取消自动续费？',
        answer: '进入"设置"->"账号与安全"->"订阅管理"，可以查看和取消已订阅的服务。'
      },
      {
        id: 8,
        question: '数据如何同步？',
        answer: '数智伴宠会自动将您的宠物信息和记录同步到云端，换设备登录后数据会自动同步，无需手动备份。'
      }
    ]
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

  toggleExpand(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      expandedId: this.data.expandedId === id ? null : id
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
