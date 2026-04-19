const { getPetList, getPetLogs, addPetLog } = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    statusBarTop: 20,
    safeBottom: 20,
    petList: [],
    allLogList: [],
    logList: [],
    selectedPetId: '',
    searchKeyword: '',
    publishModalVisible: false,
    currentLogData: {},
    userInfo: null,
    loading: false
  },

  async onLoad() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - (sys.safeArea?.bottom || sys.screenHeight)) || 0) * 2;
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo
      });
    }
    const petList = await getPetList();
    this.setData({
      statusBarTop,
      safeBottom,
      petList
    });
    this.loadLogs();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      });
    }
    // P0优先级：每次显示页面时重新加载宠物列表，确保新增宠物后数据实时同步
    this.loadPetList();
  },

  // P0优先级：加载宠物列表
  async loadPetList() {
    const petList = await getPetList();
    this.setData({
      petList
    });
    // 同时更新App全局数据
    if (!app.globalData) app.globalData = {};
    if (!app.globalData.userInfo) app.globalData.userInfo = {};
    app.globalData.userInfo.petList = petList;
  },

  async loadLogs() {
    this.setData({ loading: true });
    const logs = await getPetLogs(this.data.selectedPetId);
    this.setData({
      allLogList: logs || [],
      loading: false
    });
    this.applySearchFilter();
  },

  selectPet(e) {
    const petId = e.currentTarget.dataset.petId;
    this.setData({
      selectedPetId: petId
    });
    this.loadLogs();
  },

  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value || ''
    });
    this.applySearchFilter();
  },

  applySearchFilter() {
    const kw = (this.data.searchKeyword || '').trim();
    const list = this.data.allLogList || [];
    const logList = !kw
      ? list
      : list.filter(item => (item.content || '').includes(kw) || (item.tags || []).some(tag => String(tag).includes(kw)));
    this.setData({ logList: logList || [] });
  },

  getPetName(petId) {
    const pet = this.data.petList.find(p => p.id === petId);
    return pet ? pet.petName : '未知宠物';
  },

  formatTime(timeStr) {
    const date = new Date(timeStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  },

  showPublishModal() {
    // P0优先级：每次打开弹窗时重新加载宠物列表
    this.loadPetList();
    this.setData({
      publishModalVisible: true
    });
  },

  hidePublishModal() {
    this.setData({
      publishModalVisible: false,
      currentLogData: {}
    });
  },

  onLogDataChange(e) {
    this.setData({
      currentLogData: e.detail
    });
  },

  async submitLog() {
    const draft = this.data.currentLogData || {};
    const content = (draft.content || '').trim();
    const tags = Array.isArray(draft.tags) ? draft.tags : [];
    const publishTo = Array.isArray(draft.publishTo) ? draft.publishTo : [];

    // P0优先级：校验是否已选择宠物
    if (!draft.petId) {
      wx.showToast({
        title: '请先选择宠物',
        icon: 'none'
      });
      return;
    }

    if (!content) {
      wx.showToast({
        title: '请填写日志内容',
        icon: 'none'
      });
      return;
    }

    if (content.length < 10 || content.length > 500) {
      wx.showToast({ title: '日志内容需10-500字', icon: 'none' });
      return;
    }

    // P0优先级：校验至少选中1个话题标签
    if (!tags.length) {
      wx.showToast({ title: '请至少选择1个参与话题', icon: 'none' });
      return;
    }

    // P0优先级：校验发布范围必须有值
    if (!publishTo.length) {
      wx.showToast({ title: '请选择发布范围', icon: 'none' });
      return;
    }

    const logData = {
      ...draft,
      content,
      tags,
      publishTo,
      userId: this.data.userInfo?.id || '',
      username: this.data.userInfo?.username || ''
    };
    try {
      await addPetLog(logData);
      if (publishTo.includes('community')) {
        const allPosts = wx.getStorageSync('communityPosts') || [];
        allPosts.unshift({
          id: `from_log_${Date.now()}`,
          userId: logData.userId,
          username: logData.username,
          userAvatar: this.data.userInfo?.avatar || '',
          content: logData.content,
          tags: logData.tags,
          images: logData.images || [],
          createTime: new Date().toISOString(),
          likeCount: 0,
          commentCount: 0,
          collectCount: 0,
          comments: []
        });
        wx.setStorageSync('communityPosts', allPosts);
      }
      // P0优先级：发布成功后的跳转逻辑
      if (publishTo.includes('private') && !publishTo.includes('community')) {
        // 仅私人日志：跳转到AI健康分析报告页
        wx.showToast({
          title: '发布成功',
          icon: 'success'
        });
        this.hidePublishModal();
        this.loadLogs();
        setTimeout(() => {
          wx.navigateTo({ url: '/pages/ai-report/ai-report' });
        }, 600);
      } else if (publishTo.includes('community')) {
        // 发布到社区：弹出提示，不跳转AI报告页
        wx.showToast({
          title: '发布成功，已同步到社区',
          icon: 'success'
        });
        this.hidePublishModal();
        this.loadLogs();
      } else {
        // 其他情况
        wx.showToast({
          title: '发布成功',
          icon: 'success'
        });
        this.hidePublishModal();
        this.loadLogs();
      }
    } catch (err) {
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      });
    }
  },

  showLogActions(e) {
    const id = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      success: (res) => {
        if (res.tapIndex === 0) this.editLog(id);
        if (res.tapIndex === 1) this.deleteLogById(id);
      }
    });
  },

  editLog(id) {
    const list = wx.getStorageSync('petLogs') || [];
    const log = list.find(item => item.id === id);
    if (!log) return;
    wx.showModal({
      title: '编辑日志',
      editable: true,
      placeholderText: '请输入日志内容',
      content: log.content || '',
      success: (res) => {
        if (!res.confirm) return;
        const value = (res.content || '').trim();
        if (value.length < 10 || value.length > 500) {
          wx.showToast({ title: '日志内容需10-500字', icon: 'none' });
          return;
        }
        log.content = value;
        log.updateTime = new Date().toISOString();
        wx.setStorageSync('petLogs', list);
        this.loadLogs();
        wx.showToast({ title: '编辑成功', icon: 'success' });
      }
    });
  },

  deleteLogById(id) {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const logList = this.data.logList;
    const logIndex = logList.findIndex(l => l.id === id);

    if (logIndex === -1) {
      return;
    }

    const log = logList[logIndex];

    if (log.userId !== this.data.userInfo.id) {
      wx.showToast({
        title: '只能删除自己的日志',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条日志吗？',
      success: (res) => {
        if (res.confirm) {
          const newLogList = logList.filter(l => l.id !== id);
          this.setData({
            logList: newLogList
          });

          const allLogs = wx.getStorageSync('petLogs') || [];
          const newAllLogs = allLogs.filter(l => l.id !== id);
          wx.setStorageSync('petLogs', newAllLogs);

          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  deleteLog(e) {
    this.deleteLogById(e.currentTarget.dataset.id);
  },

  goToAiReport() {
    const logs = this.data.logList || [];
    const hasPrivate = logs.some(item => Array.isArray(item.publishTo) && item.publishTo.includes('private'));
    if (!hasPrivate) {
      wx.showToast({ title: '仅私人日志可生成AI报告', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/ai-report/ai-report' });
  }
});
