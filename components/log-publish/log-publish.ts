import { getPetList } from '../../utils/api';
import { PetInfo, PetLog } from '../../utils/type';

Component({
  properties: {
  },
  data: {
    petList: [] as PetInfo[],
    selectedPetId: '',
    selectedPetName: '',
    content: '',
    topicInput: '',
    tags: [] as string[],
    publishTo: [] as string[],
    location: '',
    healthInfo: {
      stool: '',
      appetite: '',
      spirit: ''
    },
    showPetPickerFlag: false
  },
  lifetimes: {
    async attached() {
      const petList = await getPetList();
      console.log('log-publish 组件加载，宠物列表:', petList);
      this.setData({
        petList
      });
      if (petList.length > 0) {
        this.setData({
          selectedPetId: petList[0].id,
          selectedPetName: petList[0].petName
        });
      }
      this.updateLogData();
    }
  },
  methods: {
    showPetPicker() {
      console.log('showPetPicker 被调用');
      console.log('当前宠物列表:', this.data.petList);
      if (this.data.petList.length === 0) {
        wx.showToast({
          title: '暂无宠物，请先添加宠物',
          icon: 'none'
        });
        return;
      }
      this.setData({
        showPetPickerFlag: true
      });
    },

    hidePetPicker() {
      this.setData({
        showPetPickerFlag: false
      });
    },

    selectPetFromPicker(e: WechatMiniprogram.TouchEvent) {
      console.log('selectPetFromPicker 被调用, e:', e);
      const petId = e.currentTarget.dataset.petId as string;
      console.log('选择的宠物ID:', petId);
      const pet = this.data.petList.find(p => p.id === petId);
      console.log('找到的宠物:', pet);
      this.setData({
        selectedPetId: petId,
        selectedPetName: pet ? pet.petName : '',
        showPetPickerFlag: false
      });
      console.log('更新后 selectedPetName:', this.data.selectedPetName);
      this.updateLogData();
    },

    onTopicInput(e: WechatMiniprogram.InputEvent) {
      const input = e.detail.value;
      console.log('话题输入:', input);
      // 解析输入的话题，支持 #话题 格式
      let tags: string[] = [];
      if (input) {
        // 移除 # 号，按逗号或空格分割
        const cleanInput = input.replace(/#/g, '');
        tags = cleanInput.split(/[,，\s]+/).filter(tag => tag.trim());
      }
      this.setData({
        topicInput: input,
        tags: tags
      });
      this.updateLogData();
    },

    onContentInput(e: WechatMiniprogram.InputEvent) {
      this.setData({
        content: e.detail.value
      });
      this.updateLogData();
    },

    togglePublishTo(e: WechatMiniprogram.TouchEvent) {
      const to = e.currentTarget.dataset.to as string;
      const publishTo = this.data.publishTo;
      if (publishTo.includes(to)) {
        this.setData({
          publishTo: publishTo.filter(t => t !== to)
        });
      } else {
        this.setData({
          publishTo: [...publishTo, to]
        });
      }
      this.updateLogData();
    },

    selectLocation() {
      console.log('开始定位');
      // 先检查并请求权限
      wx.getSetting({
        success: (res) => {
          console.log('权限设置:', res.authSetting);
          if (res.authSetting['scope.userLocation']) {
            // 已授权，直接定位
            this.doLocation();
          } else if (res.authSetting['scope.userLocation'] === false) {
            // 用户拒绝过，引导去设置
            wx.showModal({
              title: '位置权限',
              content: '需要获取您的位置信息，请在设置中开启位置权限',
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.openSetting({
                    success: (settingRes) => {
                      if (settingRes.authSetting['scope.userLocation']) {
                        this.doLocation();
                      }
                    }
                  });
                }
              }
            });
          } else {
            // 未授权过，请求授权
            wx.authorize({
              scope: 'scope.userLocation',
              success: () => {
                this.doLocation();
              },
              fail: () => {
                wx.showToast({
                  title: '授权失败，无法获取位置',
                  icon: 'none'
                });
              }
            });
          }
        }
      });
    },

    doLocation() {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          console.log('定位成功:', res);
          const { latitude, longitude } = res;
          wx.showToast({
            title: '定位成功',
            icon: 'success'
          });
          this.setData({
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          });
          this.updateLogData();
        },
        fail: (err) => {
          console.error('定位失败', err);
          console.error('错误码:', err.errCode);
          console.error('错误信息:', err.errMsg);
          wx.showModal({
            title: '定位失败',
            content: '定位失败，请检查手机定位服务是否开启',
            showCancel: false
          });
        }
      });
    },

    selectHealthInfo(e: WechatMiniprogram.TouchEvent) {
      const key = e.currentTarget.dataset.key as keyof typeof this.data.healthInfo;
      const value = e.currentTarget.dataset.value as string;
      const healthInfo = this.data.healthInfo;
      healthInfo[key] = value;
      this.setData({
        healthInfo
      });
      this.updateLogData();
    },

    updateLogData() {
      const logData: PetLog = {
        id: '',
        userId: wx.getStorageSync('userInfo') ? JSON.parse(wx.getStorageSync('userInfo')).id : '',
        petId: this.data.selectedPetId,
        content: this.data.content,
        tags: this.data.tags,
        publishTo: this.data.publishTo,
        location: this.data.location,
        createTime: '',
        healthInfo: this.data.tags.includes('健康') ? this.data.healthInfo : undefined
      };
      this.triggerEvent('logData', logData);
    }
  }
});
