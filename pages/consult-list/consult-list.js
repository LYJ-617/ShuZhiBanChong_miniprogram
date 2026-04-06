Page({
  data: {
    activeTab: 'all',
    tabs: ['全部', '待回复', '已完成', '已取消'],
    consultList: []
  },

  onLoad() {
    this.loadConsultList();
  },

  onShow() {
    this.loadConsultList();
  },

  loadConsultList() {
    const allConsults = wx.getStorageSync('consultList') || [];
    let filtered = allConsults;
    if (this.data.activeTab !== 'all') {
      filtered = allConsults.filter(item => item.status === this.data.activeTab);
    }
    this.setData({ consultList: filtered.reverse() });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.loadConsultList();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/consult-detail/consult-detail?id=${id}` });
  },

  goToConsult() {
    wx.navigateTo({ url: '/pages/service/service' });
  }
});