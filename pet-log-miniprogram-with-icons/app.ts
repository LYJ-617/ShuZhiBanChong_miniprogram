import { PetInfo, UserInfo } from './utils/type';

App<IAppOption>({
  globalData: {
    userInfo: null as UserInfo | null,
    petList: [] as PetInfo[]
  },
  onLaunch() {
    const userInfo = wx.getStorageSync('userInfo');
    const petList = wx.getStorageSync('petList');
    if (userInfo && petList) {
      this.globalData.userInfo = JSON.parse(userInfo);
      this.globalData.petList = JSON.parse(petList);
    } else {
      wx.redirectTo({
        url: '/pages/register/register'
      });
    }
  }
});

declare global {
  namespace WechatMiniprogram {
    interface IAppOption {
      globalData: {
        userInfo: UserInfo | null;
        petList: PetInfo[];
      };
    }
  }
}