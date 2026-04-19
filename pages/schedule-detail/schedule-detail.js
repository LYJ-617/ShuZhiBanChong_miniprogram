Page({
  data: {
    id: '',
    detail: null
  },

  onLoad(options) {
    const id = options.id || '';
    this.setData({ id });
    this.loadDetail();
  },

  loadDetail() {
    const schedules = wx.getStorageSync('petSchedules') || [];
    const detail = schedules.find(item => String(item.id) === String(this.data.id)) || null;
    this.setData({ detail });
  },

  toggleDone() {
    const schedules = wx.getStorageSync('petSchedules') || [];
    const idx = schedules.findIndex(item => String(item.id) === String(this.data.id));
    if (idx === -1) return;
    schedules[idx].isDone = !schedules[idx].isDone;
    wx.setStorageSync('petSchedules', schedules);
    this.setData({ detail: schedules[idx] });
    wx.showToast({
      title: schedules[idx].isDone ? '已完成' : '已恢复待办',
      icon: 'success'
    });
  }
});
