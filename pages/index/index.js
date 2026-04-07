const { getPetList, getPetLogs, getUserInfo } = require('../../utils/api.js');

Page({
  data: {
    username: '',
    scheduleList: [],
    hasTodayLog: false,
    todayLog: null,
    petList: []
  },

  async onLoad() {
    // 获取用户信息
    const userInfo = await getUserInfo();
    if (userInfo) {
      this.setData({
        username: userInfo.username || '主人'
      });
    }

    // 获取宠物列表
    const petList = await getPetList();
    this.setData({ petList });

    // 检查今日是否有日志
    if (petList.length > 0) {
      await this.checkTodayLog();
    }

    // 加载默认的日程提醒
    this.loadScheduleList();
  },

  async onShow() {
    // 每次显示刷新数据
    const userInfo = await getUserInfo();
    if (userInfo) {
      this.setData({ username: userInfo.username || '主人' });
    }

    const petList = await getPetList();
    this.setData({ petList });

    if (petList.length > 0) {
      await this.checkTodayLog();
    }
  },

  async checkTodayLog() {
    const logs = await getPetLogs();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    // 筛选今日日志
    const todayLogs = logs.filter(log => {
      const logDate = new Date(log.createTime).toISOString().split('T')[0];
      return logDate === todayStr;
    });

    if (todayLogs.length > 0) {
      this.setData({
        hasTodayLog: true,
        todayLog: todayLogs[0]
      });
    } else {
      this.setData({
        hasTodayLog: false,
        todayLog: null
      });
    }
  },

  loadScheduleList() {
    // 默认日程数据
    const defaultSchedule = [
      {
        id: '1',
        title: '疫苗接种',
        time: '2026-04-10',
        icon: '/static/vaccine.png',
        iconBg: '#E3F2FD',
        isDone: false
      },
      {
        id: '2',
        title: '体内驱虫',
        time: '2026-04-15',
        icon: '/static/deworm.png',
        iconBg: '#FFF3E0',
        isDone: false
      },
      {
        id: '3',
        title: '洗澡美容',
        time: '2026-04-20',
        icon: '/static/beauty.png',
        iconBg: '#F3E5F5',
        isDone: false
      }
    ];
    this.setData({ scheduleList: defaultSchedule });
  },

  // 切换tab
  switchTab(e) {
    const url = e.currentTarget.dataset.url;
    wx.switchTab({ url });
  },

  // 日程详情
  openScheduleDetail(e) {
    wx.showToast({
      title: '查看日程详情',
      icon: 'none'
    });
  },

  // 查看全部日程
  goToScheduleAll() {
    wx.showToast({
      title: '查看全部日程',
      icon: 'none'
    });
  },

  // 去记录日志
  goToWriteLog() {
    wx.switchTab({
      url: '/pages/log/log'
    });
  },

  // 查看日志详情
  goToLogDetail() {
    if (this.data.todayLog && this.data.todayLog.id) {
      wx.navigateTo({
        url: `/pages/log-detail/log-detail?id=${this.data.todayLog.id}`
      });
    }
  },

  // 跳转到注册页
  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  }
});