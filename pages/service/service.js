const { getPetList } = require('../../utils/api.js');

Page({
  data: {
    statusBarTop: 20,
    safeBottom: 20,
    activeModule: 'mall',
    keyword: '',
    mallCats: ['粮食', '零食', '玩具', '用品', '药品'],
    mallCat: '粮食',
    consultPetTypes: ['全部', '猫', '狗'],
    consultPetType: '全部',
    reserveCats: ['美容', '医疗', '寄养'],
    reserveCat: '美容',
    mallList: [],
    doctorList: [],
    reserveList: []
  },

  async onLoad() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - ((sys.safeArea && sys.safeArea.bottom) || sys.screenHeight)) || 0) * 2;
    const preset = wx.getStorageSync('serviceTab');
    if (preset) {
      this.setData({ activeModule: preset });
      wx.removeStorageSync('serviceTab');
    }
    this.setData({ statusBarTop, safeBottom });
    await getPetList();
    this.refreshLists();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    this.refreshLists();
  },

  switchModule(e) {
    this.setData({ activeModule: e.currentTarget.dataset.module });
    this.refreshLists();
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value || '' });
    this.refreshLists();
  },
  selectMallCat(e) { this.setData({ mallCat: e.currentTarget.dataset.cat }); this.refreshLists(); },
  selectConsultPetType(e) { this.setData({ consultPetType: e.currentTarget.dataset.type }); this.refreshLists(); },
  selectReserveCat(e) { this.setData({ reserveCat: e.currentTarget.dataset.cat }); this.refreshLists(); },

  refreshLists() {
    const kw = this.data.keyword.trim();
    const mallBase = [
      { id: 'm1', cat: '粮食', name: '功能粮A', desc: 'AI推荐，肠胃友好', price: 139 },
      { id: 'm2', cat: '零食', name: '冻干零食B', desc: '高蛋白低负担', price: 49 },
      { id: 'm3', cat: '玩具', name: '益智玩具C', desc: '缓解分离焦虑', price: 69 },
      { id: 'm4', cat: '用品', name: '洗护套装D', desc: '温和不刺激', price: 89 },
      { id: 'm5', cat: '药品', name: '益生菌E', desc: '调理肠道', price: 59 }
    ];
    const doctorBase = [
      { id: 'd1', petType: '猫', name: '林医生', title: '主治兽医', goodAt: '皮肤/内科', count: 1230, score: 4.9, price: 39 },
      { id: 'd2', petType: '狗', name: '周医生', title: '执业兽医', goodAt: '消化/行为', count: 980, score: 4.8, price: 49 }
    ];
    const reserveBase = [
      { id: 'r1', cat: '美容', name: '基础洗护', price: 88, store: '爱宠门店A', distance: '1.2km', count: 223 },
      { id: 'r2', cat: '医疗', name: '体检套餐', price: 199, store: '宠物医院B', distance: '2.4km', count: 96 },
      { id: 'r3', cat: '寄养', name: '日间寄养', price: 120, store: '寄养中心C', distance: '3.1km', count: 145 }
    ];
    this.setData({
      mallList: mallBase.filter(i => i.cat === this.data.mallCat).filter(i => !kw || i.name.includes(kw)),
      doctorList: doctorBase.filter(i => this.data.consultPetType === '全部' || i.petType === this.data.consultPetType).filter(i => !kw || i.goodAt.includes(kw) || i.name.includes(kw)),
      reserveList: reserveBase.filter(i => i.cat === this.data.reserveCat).filter(i => !kw || i.name.includes(kw) || i.store.includes(kw))
    });
  },

  goToMall() {
    wx.navigateTo({ url: '/pages/mall/mall' });
  },
  goToConsult() {
    wx.navigateTo({ url: '/pages/consult-list/consult-list' });
  },
  goToReservation() {
    wx.navigateTo({ url: '/pages/appointment-list/appointment-list' });
  },
  startReserveFlow(e) {
    const id = e.currentTarget.dataset.id;
    const service = (this.data.reserveList || []).find(item => item.id === id);
    if (!service) return;
    wx.showModal({
      title: '预约流程',
      content: `服务：${service.name}\n门店：${service.store}\n确认后生成明天10:00预约`,
      success: res => {
        if (!res.confirm) return;
        const appointmentList = wx.getStorageSync('appointmentList') || [];
        const date = new Date(Date.now() + 24 * 3600 * 1000);
        const appointmentTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} 10:00`;
        appointmentList.unshift({
          id: `ap_${Date.now()}`,
          shopAvatar: '🏥',
          shopName: service.store,
          serviceName: service.name,
          appointmentTime,
          status: 'pending_confirm',
          statusText: '待确认',
          createTime: new Date().toISOString()
        });
        wx.setStorageSync('appointmentList', appointmentList);
        wx.showToast({ title: '预约提交成功', icon: 'success' });
      }
    });
  }
});