import { getPetList, getPetLogs, addPetLog } from '../../utils/api.js';

Page({
  data: {
    petList: [],
    logList: [],
    selectedPetId: '',
    publishModalVisible: false,
    currentLogData: {},
    userInfo: null
  },

  async onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: JSON.parse(userInfo)
      });
    }
    const petList = await getPetList();
    this.setData({
      petList
    });
    this.loadLogs();
  },

  async loadLogs() {
    const logs = await getPetLogs(this.data.selectedPetId);
    this.setData({
      logList: logs
    });
  },

  selectPet(e) {
    const petId = e.currentTarget.dataset.petId;
    this.setData({
      selectedPetId: petId
    });
    this.loadLogs();
  },

  getPetName(petId) {
    const pet = this.data.petList.find(p => p.id === petId);
    return pet ? pet.petName : '未知宠物';
  },

  formatTime(timeStr) {
    const date = new Date(timeStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  },

  showPublishModal() {
    this.setData({
      publishModalVisible: true
    });
  },

  hidePublishModal() {
    this.setData({
      publishModalVisible: false,
      currentLogData: {}
    });
  },

  onLogDataChange(e) {
    this.setData({
      currentLogData: e.detail
    });
  },

  async submitLog() {
    if (!this.data.currentLogData.content || !this.data.currentLogData.petId) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
    const logData = {
      ...this.data.currentLogData,
      userId: this.data.userInfo?.id || '',
      username: this.data.userInfo?.username || ''
    };
    try {
      await addPetLog(logData);
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      });
      this.hidePublishModal();
      this.loadLogs();
    } catch (err) {
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      });
    }
  },

  deleteLog(e) {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const id = e.currentTarget.dataset.id;
    const logList = this.data.logList;
    const logIndex = logList.findIndex(l => l.id === id);

    if (logIndex === -1) {
      return;
    }

    const log = logList[logIndex];

    if (log.userId !== this.data.userInfo.id) {
      wx.showToast({
        title: '只能删除自己的日志',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条日志吗？',
      success: (res) => {
        if (res.confirm) {
          const newLogList = logList.filter(l => l.id !== id);
          this.setData({
            logList: newLogList
          });

          const allLogs = wx.getStorageSync('petLogs') || [];
          const newAllLogs = allLogs.filter(l => l.id !== id);
          wx.setStorageSync('petLogs', newAllLogs);

          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  goToAiReport() {
    wx.switchTab({
      url: '/pages/service/service'
    });
  }
});
