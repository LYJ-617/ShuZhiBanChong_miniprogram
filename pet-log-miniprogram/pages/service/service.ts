import { getPetList, generateAiReport } from '../../utils/api';
import { PetInfo } from '../../utils/type';

Page({
  data: {
    recommendProducts: [
      { id: '1', name: '宠物益生菌', price: 39.9 },
      { id: '2', name: '肠胃调理粮', price: 129.9 },
      { id: '3', name: '化毛膏', price: 29.9 }
    ]
  },

  async onLoad() {
    const petList = await getPetList();
    if (petList.length > 0) {
      const report = await generateAiReport(petList[0].id);
      if (report.recommendProducts.length > 0) {
        const products = report.recommendProducts.map(name => ({
          id: Date.now().toString() + Math.random(),
          name,
          price: Math.floor(Math.random() * 100) + 20
        }));
        this.setData({
          recommendProducts: products
        });
      }
    }
  },

  goToMall() {
    wx.showToast({
      title: '商城功能待开发',
      icon: 'none'
    });
  },

  goToConsult() {
    wx.showToast({
      title: '线上问诊功能待开发',
      icon: 'none'
    });
  },

  goToReservation() {
    wx.showToast({
      title: '服务预约功能待开发',
      icon: 'none'
    });
  }
});