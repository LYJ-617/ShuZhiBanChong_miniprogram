import { getPetList, getUserInfo } from '../../utils/api';
import { UserInfo, PetInfo } from '../../utils/type';

Page({
  data: {
    userInfo: null as UserInfo | null,
    petList: [] as PetInfo[]
  },

  async onLoad() {
    await this.loadUserInfo();
    const petList = await getPetList();
    this.setData({
      petList
    });
  },

  async onShow() {
    await this.loadUserInfo();
  },

  async loadUserInfo() {
    try {
      const storageUserInfo = wx.getStorageSync('userInfo');
      const apiUserInfo = await getUserInfo();
      // 优先使用本地存储的信息（因为可能包含用户修改的数据）
      const userInfo = storageUserInfo || apiUserInfo;
      this.setData({ userInfo });
    } catch (e) {
      console.error('获取用户信息失败', e);
    }
  },

  goToSetting() {
    console.log('点击设置按钮');
    wx.navigateTo({
      url: '/pages/setting/setting',
      success: () => {
        console.log('跳转设置页成功');
      },
      fail: (err) => {
        console.error('跳转设置页失败', err);
      }
    });
  },

  chooseAvatar() {
    console.log('点击头像');
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.saveAvatar(tempFilePath);
      },
      fail: (err) => {
        console.error('选择图片失败', err);
      }
    });
  },

  saveAvatar(tempFilePath: string) {
    let userInfo = this.data.userInfo || {} as UserInfo;
    userInfo = { ...userInfo, avatarUrl: tempFilePath };
    this.setData({ userInfo });
    wx.setStorageSync('userInfo', userInfo);
    wx.showToast({
      title: '头像设置成功',
      icon: 'success'
    });
  },

  logout() {
    wx.navigateTo({
      url: '/pages/setting/setting'
    });
  }
});