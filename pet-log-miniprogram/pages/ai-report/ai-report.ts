import { getPetList, generateAiReport } from '../../utils/api';
import { PetInfo, AiReport } from '../../utils/type';

Page({
  data: {
    petList: [] as PetInfo[],
    selectedPetId: '',
    report: null as AiReport | null
  },

  async onLoad() {
    const petList = await getPetList();
    this.setData({
      petList
    });
    if (petList.length > 0) {
      this.setData({
        selectedPetId: petList[0].id
      });
    }
  },

  selectPet(e: WechatMiniprogram.TouchEvent) {
    const petId = e.currentTarget.dataset.petId as string;
    this.setData({
      selectedPetId: petId,
      report: null
    });
  },

  async generateReport() {
    if (!this.data.selectedPetId) return;
    wx.showLoading({
      title: '生成报告中...'
    });
    try {
      const report = await generateAiReport(this.data.selectedPetId);
      this.setData({
        report
      });
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({
        title: '生成报告失败',
        icon: 'none'
      });
    }
  }
});