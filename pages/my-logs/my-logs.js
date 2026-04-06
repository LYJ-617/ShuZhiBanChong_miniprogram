Page({
  data: {
    filterType: 'all',
    logList: []
  },

  onLoad() {
    this.loadLogs();
  },

  onShow() {
    this.loadLogs();
  },

  loadLogs() {
    const allLogs = wx.getStorageSync('logList') || [];
    const userInfo = wx.getStorageSync('userInfo');
    let filteredLogs = allLogs;

    if (this.data.filterType === 'private') {
      filteredLogs = allLogs.filter(log => log.isPrivate === true);
    } else if (this.data.filterType === 'community') {
      filteredLogs = allLogs.filter(log => log.isPrivate === false);
    }

    if (userInfo) {
      filteredLogs = filteredLogs.filter(log => log.userId === userInfo.id);
    }

    this.setData({ logList: filteredLogs.reverse() });
  },

  switchFilter(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ filterType: type });
    this.loadLogs();
  },

  goToLogDetail(e) {
    const logId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/log-detail/log-detail?id=${logId}`
    });
  },

  deleteLog(e) {
    const logId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定删除这条日志吗？',
      success: (res) => {
        if (res.confirm) {
          let logList = this.data.logList;
          logList = logList.filter(log => log.id !== logId);
          wx.setStorageSync('logList', logList);
          this.setData({ logList });
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  }
});