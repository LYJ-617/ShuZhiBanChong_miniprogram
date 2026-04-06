Page({
  data: {
    petList: []
  },

  onLoad() {
    this.loadPetList();
  },

  onShow() {
    this.loadPetList();
  },

  loadPetList() {
    const petList = wx.getStorageSync('petList') || [];
    this.setData({ petList });
  },

  goToAddPet() {
    wx.navigateTo({
      url: '/pages/register/register?type=addPet'
    });
  },

  goToPetDetail(e) {
    const petId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/pet-detail/pet-detail?id=${petId}`
    });
  },

  deletePet(e) {
    const petId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定删除该宠物吗？删除后对应的日志、AI 分析报告将同步清除，无法恢复',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          let petList = this.data.petList;
          petList = petList.filter(pet => pet.id !== petId);
          wx.setStorageSync('petList', petList);
          this.setData({ petList });
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  }
});