Page({
  data: {
    likeList: []
  },

  onLoad() {
    this.loadLikes();
  },

  onShow() {
    this.loadLikes();
  },

  loadLikes() {
    const likeList = wx.getStorageSync('likeList') || [];
    this.setData({ likeList: likeList.reverse() });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/community-detail/community-detail?id=${id}` });
  },

  cancelLike(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '取消点赞',
      content: '确定取消点赞吗？',
      success: (res) => {
        if (res.confirm) {
          let likeList = this.data.likeList;
          likeList = likeList.filter(item => item.id !== id);
          wx.setStorageSync('likeList', likeList);
          this.setData({ likeList });
          wx.showToast({ title: '已取消点赞', icon: 'success' });
        }
      }
    });
  }
});