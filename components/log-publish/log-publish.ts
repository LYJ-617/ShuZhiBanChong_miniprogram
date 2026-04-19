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
    // P0优先级：发布范围单选互斥，默认选中"仅私人日志"
    publishTo: 'private' as string,
    images: [] as string[],
    location: '',
    // 公开位置信息勾选状态
    showLocationInCommunity: false as boolean,
    // 定位按钮文字
    locationBtnText: '获取当前位置' as string,
    // 详细地址（逆地址解析结果）
    locationAddress: '' as string,
    healthInfo: {
      stool: '',
      appetite: '',
      spirit: ''
    },
    showPetPickerFlag: false
  },
  lifetimes: {
    async attached() {
      // P0优先级：从双数据源同步读取宠物列表，兜底保障数据读取成功
      // 主数据源：App全局数据
      // 兜底数据源：微信本地storage
      await this.loadPetList();
    }
  },
  methods: {
    // ========== P0优先级：宠物选择器数据读取修复 ==========
    /**
     * 从双数据源同步读取宠物列表
     * 主数据源：App全局数据 getApp().globalData.userInfo.petList
     * 兜底数据源：微信本地storage wx.getStorageSync('userInfo').petList
     */
    async loadPetList() {
      let petList: PetInfo[] = [];

      // 优先从App全局数据读取
      try {
        const app = getApp();
        if (app.globalData && app.globalData.userInfo && app.globalData.userInfo.petList) {
          petList = app.globalData.userInfo.petList;
        }
      } catch (e) {
        console.log('从App全局数据读取宠物列表失败', e);
      }

      // 兜底：从storage读取
      if (petList.length === 0) {
        try {
          const storageUserInfo = wx.getStorageSync('userInfo');
          if (storageUserInfo) {
            const userInfo = typeof storageUserInfo === 'string' ? JSON.parse(storageUserInfo) : storageUserInfo;
            if (userInfo && userInfo.petList) {
              petList = userInfo.petList;
            }
          }
        } catch (e) {
          console.log('从storage读取宠物列表失败', e);
        }
      }

      // 如果有宠物列表，设置默认选中当前宠物
      if (petList.length > 0) {
        // 优先使用全局的currentPetInfo
        let defaultPet = petList[0];
        try {
          const app = getApp();
          if (app.globalData && app.globalData.currentPetInfo && app.globalData.currentPetInfo.id) {
            const currentPet = petList.find(p => p.id === app.globalData.currentPetInfo.id);
            if (currentPet) {
              defaultPet = currentPet;
            }
          }
        } catch (e) {
          console.log('获取当前选中宠物失败', e);
        }

        this.setData({
          petList,
          selectedPetId: defaultPet.id,
          selectedPetName: `${defaultPet.petName}（${defaultPet.breed || defaultPet.type}）`
        });
      } else {
        // 宠物列表为空
        this.setData({
          petList: [],
          selectedPetId: '',
          selectedPetName: ''
        });
      }

      this.updateLogData();
    },

    // 每次打开弹窗时重新读取宠物列表，确保数据实时同步
    refreshPetList() {
      this.loadPetList();
    },

    showPetPicker() {
      // 每次点击选择器时重新加载宠物列表
      this.loadPetList();

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
      const petId = e.currentTarget.dataset.petId as string;
      const pet = this.data.petList.find(p => p.id === petId);
      if (pet) {
        this.setData({
          selectedPetId: petId,
          selectedPetName: `${pet.petName}（${pet.breed || pet.type}）`,
          showPetPickerFlag: false
        });
        this.updateLogData();
      }
    },

    // ========== P0优先级：话题标签多选交互优化 ==========
    toggleTag(e: WechatMiniprogram.TouchEvent) {
      const tag = String(e.currentTarget.dataset.tag);
      const tags = this.data.tags.includes(tag)
        ? this.data.tags.filter(t => t !== tag)
        : [...this.data.tags, tag];
      this.setData({
        tags,
        topicInput: tags.join(' ')
      });
      this.updateLogData();
    },

    onContentInput(e: WechatMiniprogram.InputEvent) {
      this.setData({
        content: e.detail.value
      });
      this.updateLogData();
    },

    // ========== P0优先级：发布范围单选互斥逻辑 ==========
    togglePublishTo(e: WechatMiniprogram.TouchEvent) {
      const to = e.currentTarget.dataset.to as string;
      // 单选互斥：点击未选中的选项时切换选中状态
      // 点击已选中的选项时保持选中（禁止取消）
      if (this.data.publishTo !== to) {
        this.setData({
          publishTo: to
        });
        this.updateLogData();
      }
    },

    // ========== P0优先级：定位功能完善 ==========
    /**
     * 选择位置 - 使用 wx.chooseLocation 直接获取地址名称
     * 打开地图让用户选择位置，返回的 name 和 address 就是可读的地址信息
     */
    selectLocation() {
      console.log('=== 开始选择位置流程 ===');
      
      wx.chooseLocation({
        success: (res) => {
          console.log('选择位置成功:', res);
          
          if (res && res.name) {
            // 优先使用地点名称，其次使用完整地址
            const address = res.name || res.address || '';
            
            // 格式化地址：保留核心地址信息
            let displayAddress = address;
            if (displayAddress.length > 50) {
              displayAddress = displayAddress.substring(0, 50) + '...';
            }
            
            this.setData({
              location: displayAddress,
              locationData: {
                name: res.name,
                address: res.address,
                latitude: res.latitude,
                longitude: res.longitude
              },
              locationBtnText: '重新选择'
            });
            this.updateLogData();
            
            wx.showToast({
              title: '定位成功',
              icon: 'success',
              duration: 1500
            });
          } else {
            wx.showToast({
              title: '未选择位置',
              icon: 'none',
              duration: 1500
            });
          }
        },
        fail: (err) => {
          console.error('选择位置失败:', err);
          
          if (err.errMsg && err.errMsg.includes('cancel')) {
            console.log('用户取消选择位置');
          } else if (err.errMsg && err.errMsg.includes('auth deny')) {
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
            wx.showModal({
              title: '提示',
              content: '获取位置失败，请稍后重试\n\n位置是选填项，您可以跳过定位直接发布',
              confirmText: '知道了',
              showCancel: false
            });
          }
        }
      });
    },

    // 切换公开位置信息
    toggleShowLocation() {
      this.setData({
        showLocationInCommunity: !this.data.showLocationInCommunity
      });
      this.updateLogData();
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

    async chooseImages() {
      const remain = 9 - this.data.images.length;
      if (remain <= 0) {
        wx.showToast({ title: '最多上传9张', icon: 'none' });
        return;
      }
      try {
        const res = await wx.chooseMedia({
          count: remain,
          mediaType: ['image'],
          sourceType: ['album', 'camera']
        });
        const files = res.tempFiles || [];
        const compressed: string[] = [];
        for (const file of files) {
          const path = file.tempFilePath;
          let output = path;
          if ((file.size || 0) > 2 * 1024 * 1024) {
            output = await this.compressTo2MB(path);
          }
          compressed.push(output);
        }
        this.setData({
          images: [...this.data.images, ...compressed].slice(0, 9)
        });
        this.updateLogData();
      } catch (err) {}
    },

    async compressTo2MB(path: string) {
      const qualitySteps = [80, 65, 50, 35];
      let current = path;
      for (const quality of qualitySteps) {
        try {
          const r = await wx.compressImage({
            src: current,
            quality
          });
          current = r.tempFilePath;
          const info = await wx.getFileInfo({ filePath: current });
          if (info.size <= 2 * 1024 * 1024) return current;
        } catch (err) {
          break;
        }
      }
      return current;
    },

    previewImage(e: WechatMiniprogram.TouchEvent) {
      const index = Number(e.currentTarget.dataset.index || 0);
      wx.previewImage({
        current: this.data.images[index],
        urls: this.data.images
      });
    },

    removeImage(e: WechatMiniprogram.TouchEvent) {
      const index = Number(e.currentTarget.dataset.index);
      const images = [...this.data.images];
      images.splice(index, 1);
      this.setData({ images });
      this.updateLogData();
    },

    moveImageLeft(e: WechatMiniprogram.TouchEvent) {
      const index = Number(e.currentTarget.dataset.index);
      if (index <= 0) return;
      const images = [...this.data.images];
      [images[index - 1], images[index]] = [images[index], images[index - 1]];
      this.setData({ images });
      this.updateLogData();
    },

    moveImageRight(e: WechatMiniprogram.TouchEvent) {
      const index = Number(e.currentTarget.dataset.index);
      if (index >= this.data.images.length - 1) return;
      const images = [...this.data.images];
      [images[index], images[index + 1]] = [images[index + 1], images[index]];
      this.setData({ images });
      this.updateLogData();
    },

    updateLogData() {
      const logData: PetLog = {
        id: '',
        userId: wx.getStorageSync('userInfo')?.id || '',
        petId: this.data.selectedPetId,
        content: this.data.content,
        tags: this.data.tags,
        // P0优先级：发布范围单选，存储为字符串
        publishTo: [this.data.publishTo],
        images: this.data.images,
        location: this.data.location,
        // 公开位置信息
        locationVisible: this.data.showLocationInCommunity,
        createTime: '',
        healthInfo: this.data.tags.includes('医疗知识') ? this.data.healthInfo : undefined
      };
      this.triggerEvent('logData', logData);
    },

    // 阻止事件冒泡的空方法
    doNothing() {}
  }
});
