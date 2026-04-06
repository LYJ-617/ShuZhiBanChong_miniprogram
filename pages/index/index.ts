import { getPetLogs, getPetList, getUserInfo } from '../../utils/api';
import { PetLog } from '../../utils/type';

Page({
  data: {
    reminders: [],
    hasUnrecorded: false,
    username: ''
  },

  async onLoad() {
    const userInfo = await getUserInfo();
    if (userInfo) {
      this.setData({
        username: userInfo.username
      });
    }

    this.loadReminders();

    const petList = await getPetList();
    if (petList.length > 0) {
      const logs = await getPetLogs();
      const today = new Date().toDateString();
      const hasTodayLog = logs.some((log: PetLog) => {
        const logDate = new Date(log.createTime).toDateString();
        return logDate === today;
      });
      this.setData({
        hasUnrecorded: !hasTodayLog
      });
    }
  },

  loadReminders() {
    const reminders = wx.getStorageSync('reminders') || [];
    this.setData({
      reminders
    });
  },

  addReminder() {
    wx.showModal({
      title: '添加日程提醒',
      editable: true,
      placeholderText: '请输入提醒内容',
      success: (res) => {
        if (res.confirm && res.content) {
          wx.showModal({
            title: '设置时间',
            editable: true,
            placeholderText: '例如：2026-03-15 或 每天',
            success: (timeRes) => {
              if (timeRes.confirm && timeRes.content) {
                const newReminder = {
                  id: Date.now().toString(),
                  content: res.content,
                  time: timeRes.content
                };
                const reminders = [...this.data.reminders, newReminder];
                this.setData({
                  reminders
                });
                wx.setStorageSync('reminders', reminders);
                wx.showToast({
                  title: '添加成功',
                  icon: 'success'
                });
              }
            }
          });
        }
      }
    });
  },

  deleteReminder(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条提醒吗？',
      success: (res) => {
        if (res.confirm) {
          const reminders = this.data.reminders.filter(item => item.id !== id);
          this.setData({
            reminders
          });
          wx.setStorageSync('reminders', reminders);
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  goToLog() {
    wx.switchTab({
      url: '/pages/log/log'
    });
  },

  goToCommunity() {
    wx.switchTab({
      url: '/pages/community/community'
    });
  },

  goToService() {
    wx.switchTab({
      url: '/pages/service/service'
    });
  },

  goToMine() {
    wx.switchTab({
      url: '/pages/mine/mine'
    });
  },

  goToAiReport() {
    wx.switchTab({
      url: '/pages/service/service'
    });
  }
});