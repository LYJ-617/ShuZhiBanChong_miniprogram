Page({
  data: {
    activeTab: 'coupon',
    tabs: ['优惠券', '会员卡', '体验券'],
    couponList: []
  },

  onLoad() {
    this.loadCouponList();
  },

  onShow() {
    this.loadCouponList();
  },

  loadCouponList() {
    const allCoupons = wx.getStorageSync('couponList') || [];
    const typeMap = { 'coupon': '优惠券', 'member': '会员卡', 'trial': '体验券' };
    let filtered = allCoupons;
    if (this.data.activeTab !== 'all') {
      filtered = allCoupons.filter(item => item.type === this.data.activeTab && item.status === 'valid');
    }
    this.setData({ couponList: filtered });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.loadCouponList();
  },

  useCoupon(e) {
    const id = e.currentTarget.dataset.id;
    wx.switchTab({ url: '/pages/mall/mall' });
  }
});