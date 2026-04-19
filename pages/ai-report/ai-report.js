const { getPetList, generateAiReport } = require('../../utils/api.js');

Page({
  data: {
    statusBarTop: 20,
    safeBottom: 20,
    petList: [],
    selectedPetId: '',
    selectedPet: null,
    petAgeText: '',
    report: null,
    keywords: [],
    diseaseRank: [],
    riskText: '',
    riskDesc: '',
    history: []
  },

  async onLoad() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - ((sys.safeArea && sys.safeArea.bottom) || sys.screenHeight)) || 0) * 2;
    this.setData({ statusBarTop, safeBottom });
    const petList = await getPetList() || [];
    this.setData({
      petList
    });
    if (petList.length > 0) {
      this.setData({
        selectedPetId: petList[0].id,
        selectedPet: petList[0],
        petAgeText: this.calcAge(petList[0].birthday)
      });
    }
    this.loadHistory();
  },

  selectPet(e) {
    const petId = e.currentTarget.dataset.petId;
    const pet = this.data.petList.find(item => item.id === petId);
    this.setData({
      selectedPetId: petId,
      selectedPet: pet || null,
      petAgeText: pet ? this.calcAge(pet.birthday) : '',
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
      const parsed = this.parseReport(report);
      this.setData({
        report,
        ...parsed
      });
      this.saveHistory(report, parsed.riskText);
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({
        title: '生成报告失败',
        icon: 'none'
      });
    }
  },

  parseReport(report) {
    const logs = (wx.getStorageSync('petLogs') || []).filter(item => item.petId === this.data.selectedPetId && Array.isArray(item.publishTo) && item.publishTo.includes('private'));
    const text = logs.map(item => `${item.content || ''} ${(item.tags || []).join(' ')}`).join(' ');
    const words = ['食欲', '精神', '稀软', '便便', '呕吐', '咳嗽', '活跃', '睡眠'].filter(k => text.includes(k));
    const keywords = words.length ? words.slice(0, 8) : ['日常', '饮食', '精神'];
    const diseaseRank = (report.possibleDiseases || []).slice(0, 4).map((name, index) => ({
      name,
      prob: `${85 - index * 10}%`,
      symptom: keywords.slice(0, 2).join(' / ') || '日志关键症状'
    }));
    const map = { low: '正常', medium: '注意', high: '警惕' };
    const descMap = {
      low: '整体风险较低，建议保持规律饮食与作息。',
      medium: '存在一定健康波动，建议继续观察并做好记录。',
      high: '风险偏高，请尽快联系专业兽医进一步评估。'
    };
    return {
      keywords,
      diseaseRank,
      riskText: map[report.riskLevel] || '正常',
      riskDesc: descMap[report.riskLevel] || descMap.low
    };
  },

  calcAge(birthday) {
    if (!birthday) return '未知';
    const diff = Date.now() - new Date(birthday).getTime();
    const day = Math.max(1, Math.floor(diff / (24 * 3600 * 1000)));
    if (day < 30) return `${day}天`;
    if (day < 365) return `${Math.floor(day / 30)}个月`;
    return `${(day / 365).toFixed(1)}岁`;
  },

  saveHistory(report, riskText) {
    const history = wx.getStorageSync('aiReportHistory') || [];
    history.unshift({
      id: `r_${Date.now()}`,
      petId: this.data.selectedPetId,
      petName: this.data.selectedPet ? this.data.selectedPet.petName : report.petName,
      riskText,
      date: new Date().toLocaleString(),
      report
    });
    wx.setStorageSync('aiReportHistory', history.slice(0, 20));
    this.loadHistory();
  },

  loadHistory() {
    const history = (wx.getStorageSync('aiReportHistory') || []).filter(item => !this.data.selectedPetId || item.petId === this.data.selectedPetId);
    this.setData({ history });
  },

  openHistory(e) {
    const id = e.currentTarget.dataset.id;
    const item = (wx.getStorageSync('aiReportHistory') || []).find(i => i.id === id);
    if (!item) return;
    this.setData({
      report: item.report,
      ...this.parseReport(item.report),
      riskText: item.riskText
    });
  },

  goService(e) {
    const type = e.currentTarget.dataset.type || 'mall';
    wx.switchTab({ url: '/pages/service/service' });
    wx.setStorageSync('serviceTab', type);
  },

  shareReport() {
    wx.showShareMenu({ withShareTicket: true });
    wx.showToast({ title: '可通过右上角分享', icon: 'none' });
  },

  printReport() {
    wx.showModal({
      title: '打印提示',
      content: '建议先分享为图片或保存后按A4纵向打印。',
      showCancel: false
    });
  }
});
