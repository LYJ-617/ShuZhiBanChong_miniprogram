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
  }
});