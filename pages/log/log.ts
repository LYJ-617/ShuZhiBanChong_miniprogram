import { getPetList, getPetLogs, addPetLog } from '../../utils/api';
import { PetInfo, PetLog } from '../../utils/type';

Page({
  data: {
    petList: [] as PetInfo[],
    logList: [] as PetLog[],
    selectedPetId: '',
    publishModalVisible: false,
    currentLogData: {} as PetLog
  },

  async onLoad() {
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

  selectPet(e: WechatMiniprogram.TouchEvent) {
    const petId = e.currentTarget.dataset.petId as string;
    this.setData({
      selectedPetId: petId
    });
    this.loadLogs();
  },

  getPetName(petId: string): string {
    const pet = this.data.petList.find(p => p.id === petId);
    return pet ? pet.petName : '未知宠物';
  },

  formatTime(timeStr: string): string {
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
      currentLogData: {} as PetLog
    });
  },

  onLogDataChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({
      currentLogData: e.detail
    });
  },

  async submitLog() {
    if (!this.data.currentLogData.content || !this.data.currentLogData.petId || this.data.currentLogData.publishTo.length === 0) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
    try {
      await addPetLog(this.data.currentLogData);
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

  goToAiReport() {
    wx.switchTab({
      url: '/pages/service/service'
    });
  }
});