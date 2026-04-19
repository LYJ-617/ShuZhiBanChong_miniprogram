Page({
  data: {
    activeTab: 'all',
    tabs: ['全部', '待确认', '已确认', '已完成', '已取消'],
    appointmentList: []
  },

  onLoad() {
    this.loadAppointmentList();
  },

  onShow() {
    this.loadAppointmentList();
  },

  loadAppointmentList() {
    const allAppointments = wx.getStorageSync('appointmentList') || [];
    let filtered = allAppointments;
    if (this.data.activeTab !== 'all') {
      filtered = allAppointments.filter(item => item.status === this.data.activeTab);
    }
    this.setData({ appointmentList: filtered.reverse() });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.loadAppointmentList();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/appointment-detail/appointment-detail?id=${id}` });
  },

  goToAppointment() {
    wx.navigateTo({ url: '/pages/service/service' });
  },

  cancelAppointment(e) {
    const id = e.currentTarget.dataset.id;
    const list = wx.getStorageSync('appointmentList') || [];
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return;
    const target = list[index];
    const appointmentTime = new Date(target.appointmentTime.replace(/-/g, '/')).getTime();
    const diff = appointmentTime - Date.now();
    if (diff < 24 * 3600 * 1000) {
      wx.showToast({ title: '仅支持提前24小时取消', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '确认取消',
      content: '确定取消该预约吗？',
      success: (res) => {
        if (!res.confirm) return;
        list[index].status = 'cancelled';
        list[index].statusText = '已取消';
        wx.setStorageSync('appointmentList', list);
        this.loadAppointmentList();
        wx.showToast({ title: '已取消预约', icon: 'success' });
      }
    });
  }
});