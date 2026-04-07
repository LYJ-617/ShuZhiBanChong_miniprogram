// pages/index/index.ts
Page({
  /**
   * 页面初始数据
   */
  data: {
    // 日程提醒列表
    scheduleList: [
      {
        id: 1,
        title: "猫咪疫苗接种",
        time: "今天 10:00",
        icon: "/static/images/schedule/vaccine.png",
        iconBg: "#E3F2FD",
        isDone: false
      },
      {
        id: 2,
        title: "体内驱虫",
        time: "今天 18:00",
        icon: "/static/images/schedule/drug.png",
        iconBg: "#E8F5E9",
        isDone: false
      },
      {
        id: 3,
        title: "每日喂药",
        time: "今天 20:00",
        icon: "/static/images/schedule/feed.png",
        iconBg: "#FFF3E0",
        isDone: false
      }
    ],
    // 今日日志状态
    hasTodayLog: false,
    // 今日日志数据
    todayLog: {
      content: "今天毛孩子食欲很好，拉的粑粑也很健康，玩了一下午逗猫棒，精神状态满分~",
      createTime: "2026-04-07 12:30",
      tags: ["日常记录", "健康状态"]
    }
  },

  /**
   * tab切换跳转
   */
  switchTab(e: WechatMiniprogram.TouchEvent) {
    const url = e.currentTarget.dataset.url;
    wx.switchTab({ url });
  },

  /**
   * 打开日程提醒详情
   */
  openScheduleDetail(e: WechatMiniprogram.TouchEvent) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: item.title,
      content: `时间：${item.time}\n状态：${item.isDone ? '已完成' : '待完成'}`,
      showCancel: true,
      cancelText: '关闭',
      confirmText: item.isDone ? '取消完成' : '标记完成',
      success: (res) => {
        if (res.confirm) {
          // 标记完成逻辑，后续对接后端
          wx.showToast({ title: '操作成功', icon: 'success' });
        }
      }
    });
  },

  /**
   * 查看全部日程
   */
  goToScheduleAll() {
    wx.showToast({ title: '跳转到全部日程页', icon: 'none' });
    // 后续创建日程页后替换为跳转逻辑
  },

  /**
   * 跳转到写日志页
   */
  goToWriteLog() {
    wx.switchTab({ url: '/pages/diary/diary' });
  },

  /**
   * 跳转到日志详情
   */
  goToLogDetail() {
    wx.showToast({ title: '跳转到日志详情页', icon: 'none' });
    // 后续创建详情页后替换为跳转逻辑
  },

  /**
   * 页面加载时校验登录状态
   */
  onLoad() {
    // 校验是否登录
    const isLogin = wx.getStorageSync('isLogin');
    const hasRegisterPet = wx.getStorageSync('hasRegisterPet');
    
    if (!isLogin) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    if (!hasRegisterPet) {
      wx.redirectTo({ url: '/pages/petRegister/petRegister' });
      return;
    }

    // 模拟获取今日日志状态，后续对接后端替换
    this.setData({
      hasTodayLog: false // 测试无日志状态，改为true测试有日志状态
    });
  },

  /**
   * 页面显示时同步tabBar选中状态
   */
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }

    // 页面显示时刷新数据，后续对接后端
    this.onPullDownRefresh();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    // 后续对接后端，刷新日程和日志数据
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
})