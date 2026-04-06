import { getPetList } from '../../utils/api.js';

Component({
  properties: {
  },
  data: {
    petList: [],
    selectedPetId: '',
    selectedPetName: '',
    content: '',
    topicInput: '',
    tags: [],
    tagOptions: ['日常', '科普', '健康', '趣事'],
    publishTo: [],
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

    selectPetFromPicker(e) {
      console.log('selectPetFromPicker 被调用, e:', e);
      const petId = e.currentTarget.dataset.petId;
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

    onTopicInput(e) {
      const input = e.detail.value;
      console.log('话题输入:', input);
      // 解析输入的话题，支持 #话题 格式
      let tags = [];
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

    onContentInput(e) {
      this.setData({
        content: e.detail.value
      });
      this.updateLogData();
    },

    togglePublishTo(e) {
      const to = e.currentTarget.dataset.to;
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
      console.log('=== 开始定位流程 ===');
      wx.showLoading({
        title: '正在获取位置...',
        mask: true
      });

      // 先检查并请求权限
      wx.getSetting({
        success: (res) => {
          console.log('权限设置:', res.authSetting);
          wx.hideLoading();

          if (res.authSetting['scope.userLocation']) {
            // 已授权，直接定位
            console.log('已有位置权限，开始定位');
            this.doLocation();
          } else if (res.authSetting['scope.userLocation'] === false) {
            // 用户拒绝过，引导去设置
            console.log('位置权限被拒绝，引导用户去设置');
            wx.showModal({
              title: '位置权限',
              content: '需要获取您的位置信息，请在设置中开启位置权限',
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.openSetting({
                    success: (settingRes) => {
                      console.log('设置页面返回，权限状态:', settingRes.authSetting);
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
            console.log('未授权，请求位置权限');
            wx.authorize({
              scope: 'scope.userLocation',
              success: () => {
                console.log('授权成功，开始定位');
                this.doLocation();
              },
              fail: (err) => {
                console.error('授权失败:', err);
                wx.showModal({
                  title: '位置权限',
                  content: '位置信息是选填项，您可以跳过定位直接发布日志',
                  confirmText: '知道了',
                  showCancel: false
                });
              }
            });
          }
        },
        fail: (err) => {
          console.error('获取设置失败:', err);
          wx.hideLoading();
          wx.showToast({
            title: '获取权限设置失败',
            icon: 'none'
          });
        }
      });
    },

    doLocation() {
      wx.showLoading({
        title: '正在定位...',
        mask: true
      });

      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          console.log('定位成功:', res);
          wx.hideLoading();

          const { latitude, longitude } = res;
          wx.showToast({
            title: '定位成功',
            icon: 'success',
            duration: 1500
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
          wx.hideLoading();

          // 根据错误码给出不同的提示
          let errorMsg = '定位失败';
          if (err.errCode === 2) {
            errorMsg = '定位失败：位置服务未开启';
          } else if (err.errCode === 1) {
            errorMsg = '定位失败：权限被拒绝';
          } else if (err.errCode === 3) {
            errorMsg = '定位失败：超时';
          }

          wx.showModal({
            title: '提示',
            content: errorMsg + '\n\n位置是选填项，您可以跳过定位直接发布',
            confirmText: '知道了',
            showCancel: false
          });
        }
      });
    },

    selectHealthInfo(e) {
      const key = e.currentTarget.dataset.key;
      const value = e.currentTarget.dataset.value;
      const healthInfo = this.data.healthInfo;
      healthInfo[key] = value;
      this.setData({
        healthInfo
      });
      this.updateLogData();
    },

    updateLogData() {
      const logData = {
        id: '',
        userId: wx.getStorageSync('userInfo') ? JSON.parse(wx.getStorageSync('userInfo')).id : '',
        petId: this.data.selectedPetId,
        content: this.data.content,
        tags: this.data.tags,
        publishTo: ['petLog'],
        location: this.data.location,
        createTime: '',
        healthInfo: this.data.tags.includes('健康') ? this.data.healthInfo : undefined
      };
      this.triggerEvent('logData', logData);
    },
    doNothing() {
      // 阻止事件冒泡的空方法
    }
  }
});
