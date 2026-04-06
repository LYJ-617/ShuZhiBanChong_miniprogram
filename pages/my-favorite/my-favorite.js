Page({
  data: {
    activeTab: 'community',
    tabs: ['社区动态', '商品', '兽医专家', '线下商家'],
    favorites: []
  },

  onLoad() {
    this.loadFavorites();
  },

  onShow() {
    this.loadFavorites();
  },

  loadFavorites() {
    const favorites = wx.getStorageSync('favorites') || [];
    const activeTab = this.data.activeTab;
    let filtered = favorites;
    if (activeTab !== 'community') {
      filtered = favorites.filter(item => item.type === activeTab);
    }
    this.setData({ favorites: filtered });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.loadFavorites();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type;
    if (type === 'community') {
      wx.navigateTo({ url: `/pages/community-detail/community-detail?id=${id}` });
    } else if (type === 'product') {
      wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
    }
  },

  cancelFavorite(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '取消收藏',
      content: '确定取消收藏吗？',
      success: (res) => {
        if (res.confirm) {
          let favorites = this.data.favorites;
          favorites = favorites.filter(item => item.id !== id);
          wx.setStorageSync('favorites', favorites);
          this.setData({ favorites });
          wx.showToast({ title: '已取消收藏', icon: 'success' });
        }
      }
    });
  }
});