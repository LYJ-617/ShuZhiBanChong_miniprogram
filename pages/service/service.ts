import { getPetList, generateAiReport } from '../../utils/api';
import { PetInfo } from '../../utils/type';

Page({
  data: {
    recommendProducts: [] as Array<{ id: string; name: string; price: number; reason: string }>,
    recommendDoctors: [] as Array<{ id: string; name: string; specialty: string }>,
    recommendHospitals: [] as Array<{ id: string; name: string; distance: string }>,
    selectedPetId: '',
    petList: [] as PetInfo[]
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
      this.generateRecommendations(petList[0].id);
    }
  },

  async selectPet(e: WechatMiniprogram.TouchEvent) {
    const petId = e.currentTarget.dataset.petId as string;
    this.setData({
      selectedPetId: petId
    });
    this.generateRecommendations(petId);
  },

  async generateRecommendations(petId: string) {
    const report = await generateAiReport(petId);
    
    // 生成推荐商品
    const products = report.recommendProducts?.map(name => ({
      id: Date.now().toString() + Math.random(),
      name,
      price: Math.floor(Math.random() * 100) + 20,
      reason: this.getProductReason(name)
    })) || [];

    // 生成推荐医生
    const doctors = report.recommendDoctors?.map(name => {
      const [namePart, specialty] = name.split('（');
      return {
        id: Date.now().toString() + Math.random(),
        name: namePart,
        specialty: specialty ? specialty.replace('）', '') : '全科'
      };
    }) || [];

    // 生成推荐医院
    const hospitals = report.recommendHospitals?.map(name => {
      const [namePart, distance] = name.split('（');
      return {
        id: Date.now().toString() + Math.random(),
        name: namePart,
        distance: distance ? distance.replace('）', '') : '未知距离'
      };
    }) || [];

    this.setData({
      recommendProducts: products,
      recommendDoctors: doctors,
      recommendHospitals: hospitals
    });
  },

  getProductReason(productName: string): string {
    if (productName.includes('益生菌')) {
      return '根据您的宠物健康报告，建议调理肠胃哦';
    } else if (productName.includes('化毛膏')) {
      return '根据掉毛情况，建议使用化毛膏帮助排毛';
    } else if (productName.includes('调理粮')) {
      return '针对当前健康状态，建议食用易消化的调理粮';
    }
    return '为您贴心推荐';
  },

  goToMall() {
    wx.showToast({
      title: '商城功能开发中',
      icon: 'none'
    });
  },

  goToConsult() {
    wx.showToast({
      title: '线上问诊功能开发中',
      icon: 'none'
    });
  },

  goToReservation() {
    wx.showToast({
      title: '服务预约功能开发中',
      icon: 'none'
    });
  },

  buyProduct() {
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success'
    });
  }
});