Page({
  data: {
    activeTab: 'all',
    tabs: ['全部', '待付款', '待发货', '待收货', '已完成', '售后'],
    orderList: []
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    this.loadOrders();
  },

  loadOrders() {
    const allOrders = wx.getStorageSync('orderList') || [];
    let filtered = allOrders;
    const statusMap = {
      'pending_payment': '待付款',
      'pending_ship': '待发货',
      'shipped': '待收货',
      'completed': '已完成',
      'refund': '售后'
    };
    if (this.data.activeTab !== 'all') {
      const targetStatus = this.data.activeTab;
      filtered = allOrders.filter(order => {
        if (targetStatus === 'pending_payment') return order.status === 'pending_payment';
        if (targetStatus === 'pending_ship') return order.status === 'pending_ship';
        if (targetStatus === 'pending_receipt') return order.status === 'shipped';
        if (targetStatus === 'completed') return order.status === 'completed';
        if (targetStatus === 'refund') return order.status === 'refund';
        return true;
      });
    }
    this.setData({ orderList: filtered.reverse() });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.loadOrders();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` });
  },

  goToMall() {
    wx.switchTab({ url: '/pages/mall/mall' });
  }
});