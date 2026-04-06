Page({
  data: {
    userInfo: {},
    signatureLength: 0,
    showYearPickerFlag: false,
    showMonthPickerFlag: false,
    showDayPickerFlag: false,
    showRegionPickerFlag: false,
    yearList: [],
    monthList: [],
    dayList: [],
    selectedYear: '',
    selectedMonth: '',
    selectedDay: '',
    provinces: ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '湖北省', '湖南省', '山东省', '河南省'],
    cities: [],
    districts: [],
    selectedProvince: '',
    selectedCity: '',
    selectedDistrict: '',
    regionTab: 0
  },

  onLoad() {
    this.loadUserInfo();
    this.initYearList();
    this.initMonthList();
  },

  initYearList() {
    const currentYear = new Date().getFullYear();
    const yearList = [];
    for (let i = currentYear; i >= 1900; i--) {
      yearList.push(i);
    }
    this.setData({ yearList });
  },

  initMonthList() {
    const monthList = [];
    for (let i = 1; i <= 12; i++) {
      monthList.push(i);
    }
    this.setData({ monthList });
  },

  initDayList(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const dayList = [];
    for (let i = 1; i <= daysInMonth; i++) {
      dayList.push(i);
    }
    this.setData({ dayList });
  },

  loadUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo') || {};
      this.setData({
        userInfo,
        signatureLength: (userInfo.signature || '').length
      });
    } catch (e) {
      console.error('获取用户信息失败', e);
    }
  },

  selectGender(e) {
    const gender = e.currentTarget.dataset.value;
    const userInfo = this.data.userInfo;
    userInfo.gender = gender;
    this.setData({ userInfo });
  },

  selectRegion() {
    this.setData({
      showRegionPickerFlag: true,
      regionTab: 0
    });
  },

  hideRegionPicker() {
    this.setData({
      showRegionPickerFlag: false
    });
  },

  switchRegionTab(e) {
    const tab = parseInt(e.currentTarget.dataset.tab);
    this.setData({ regionTab: tab });
  },

  selectProvince(e) {
    const province = e.currentTarget.dataset.province;
    this.setData({
      selectedProvince: province,
      regionTab: 1,
      cities: ['市辖区', '市'],
      districts: []
    });
  },

  selectCity(e) {
    const city = e.currentTarget.dataset.city;
    this.setData({
      selectedCity: city,
      regionTab: 2,
      districts: ['朝阳区', '海淀区', '西城区', '东城区', '丰台区', '石景山区']
    });
  },

  selectDistrict(e) {
    const district = e.currentTarget.dataset.district;
    const userInfo = this.data.userInfo;
    userInfo.region = `${this.data.selectedProvince}${this.data.selectedCity}${district}`;
    this.setData({
      userInfo,
      selectedDistrict: district,
      showRegionPickerFlag: false
    });
  },

  onSignatureInput(e) {
    const signature = e.detail.value;
    const userInfo = this.data.userInfo;
    userInfo.signature = signature;
    this.setData({
      userInfo,
      signatureLength: signature.length
    });
  },

  showYearPicker() {
    this.setData({ showYearPickerFlag: true });
  },

  hideYearPicker() {
    this.setData({ showYearPickerFlag: false });
  },

  selectYear(e) {
    const year = e.currentTarget.dataset.year;
    this.setData({
      selectedYear: year,
      showYearPickerFlag: false,
      showMonthPickerFlag: true
    });
  },

  hideMonthPicker() {
    this.setData({ showMonthPickerFlag: false });
  },

  selectMonth(e) {
    const month = e.currentTarget.dataset.month;
    this.setData({
      selectedMonth: month,
      showMonthPickerFlag: false,
      showDayPickerFlag: true
    });
    this.initDayList(this.data.selectedYear, month);
  },

  hideDayPicker() {
    this.setData({ showDayPickerFlag: false });
  },

  selectDay(e) {
    const day = e.currentTarget.dataset.day;
    const userInfo = this.data.userInfo;
    userInfo.birthday = `${this.data.selectedYear}-${this.data.selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    this.setData({
      userInfo,
      selectedDay: day,
      showDayPickerFlag: false
    });
  },

  saveInfo() {
    try {
      const userInfo = this.data.userInfo;
      wx.setStorageSync('userInfo', userInfo);
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (e) {
      console.error('保存失败', e);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  }
});
