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
    tagOptions: ['日常记录', '医疗知识', '好物分享', '科普知识'],
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

    toggleTag(e) {
      const tag = e.currentTarget.dataset.tag;
      const tags = this.data.tags;
      if (tags.includes(tag)) {
        this.setData({
          tags: tags.filter(t => t !== tag)
        });
      } else {
        this.setData({
          tags: [...tags, tag]
        });
      }
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
      console.log('=== 开始选择位置流程 ===');
      
      // 使用 wx.chooseLocation API 直接获取地址名称
      // 这个 API 会打开地图让用户选择位置，返回的 name 和 address 就是可读的地址信息
      wx.chooseLocation({
        success: (res) => {
          console.log('选择位置成功:', res);
          
          if (res && res.name) {
            // 优先使用地点名称，其次使用完整地址
            const address = res.name || res.address || '';
            
            // 格式化地址：移除冗余信息，保留核心地址
            let displayAddress = address;
            if (displayAddress.length > 50) {
              // 如果地址过长，截取前50个字符并添加省略号
              displayAddress = displayAddress.substring(0, 50) + '...';
            }
            
            this.setData({
              location: displayAddress,
              locationData: {
                name: res.name,
                address: res.address,
                latitude: res.latitude,
                longitude: res.longitude
              }
            });
            this.updateLogData();
            
            wx.showToast({
              title: '定位成功',
              icon: 'success',
              duration: 1500
            });
          } else {
            // 用户未选择有效位置
            wx.showToast({
              title: '未选择位置',
              icon: 'none',
              duration: 1500
            });
          }
        },
        fail: (err) => {
          console.error('选择位置失败:', err);
          
          // 处理不同错误情况
          if (err.errMsg && err.errMsg.includes('cancel')) {
            // 用户主动取消，不做提示
            console.log('用户取消选择位置');
          } else if (err.errMsg && err.errMsg.includes('auth deny')) {
            // 权限被拒绝
            wx.showModal({
              title: '位置权限',
              content: '需要获取您的位置信息，请在设置中开启位置权限',
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.openSetting();
                }
              }
            });
          } else {
            // 其他错误
            wx.showModal({
              title: '提示',
              content: '获取位置失败，请稍后重试\n\n位置是选填项，您可以跳过定位直接发布',
              confirmText: '知道了',
              showCancel: false
            });
          }
        },
        complete: () => {
          console.log('chooseLocation 调用完成');
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
        locationData: this.data.locationData,
        createTime: '',
        healthInfo: this.data.tags.includes('健康') ? this.data.healthInfo : undefined
      };
      this.triggerEvent('logData', logData);
    },
    // 清除位置
    clearLocation() {
      this.setData({
        location: '',
        locationData: null
      });
      this.updateLogData();
      wx.showToast({
        title: '已清除位置',
        icon: 'success',
        duration: 1000
      });
    },
    // 重置表单（供外部调用）
    resetForm() {
      this.setData({
        selectedPetId: this.data.petList.length > 0 ? this.data.petList[0].id : '',
        selectedPetName: this.data.petList.length > 0 ? this.data.petList[0].petName : '',
        content: '',
        tags: [],
        topicInput: '',
        publishTo: [],
        location: '',
        locationData: null,
        images: [],
        healthInfo: {
          stool: '',
          appetite: '',
          spirit: ''
        }
      });
      this.updateLogData();
    },
    doNothing() {
      // 阻止事件冒泡的空方法
    }
  }
});
