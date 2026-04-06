Page({
  data: {
    commentList: []
  },

  onLoad() {
    this.loadComments();
  },

  onShow() {
    this.loadComments();
  },

  loadComments() {
    const commentList = wx.getStorageSync('commentList') || [];
    this.setData({ commentList: commentList.reverse() });
  },

  goToDetail(e) {
    const postId = e.currentTarget.dataset.postId;
    wx.navigateTo({ url: `/pages/community-detail/community-detail?id=${postId}` });
  },

  deleteComment(e) {
    const commentId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除评论',
      content: '确定删除这条评论吗？',
      success: (res) => {
        if (res.confirm) {
          let commentList = this.data.commentList;
          commentList = commentList.filter(item => item.id !== commentId);
          wx.setStorageSync('commentList', commentList);
          this.setData({ commentList });
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  }
});