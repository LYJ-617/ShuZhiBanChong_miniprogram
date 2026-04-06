import { getPetList, getUserInfo } from '../../utils/api';
import { UserInfo, PetInfo } from '../../utils/type';

Page({
  data: {
    userInfo: null as UserInfo | null,
    petList: [] as PetInfo[]
  },

  async onLoad() {
    const userInfo = await getUserInfo();
    const petList = await getPetList();
    this.setData({
      userInfo,
      petList
    });
  },

  goToSetting() {
    wx.showToast({
      title: '设置功能待开发',
      icon: 'none'
    });
  },

  logout() {
    wx.showModal({
      title: '确认退出登录？',
      content: '退出后将清除本地用户信息',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('petList');
          wx.removeStorageSync('petLogs');
          wx.redirectTo({
            url: '/pages/register/register'
          });
        }
      }
    });
  }
});