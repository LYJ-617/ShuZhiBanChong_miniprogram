import { getPetList, getUserInfo } from '../../utils/api';
import { UserInfo, PetInfo, CommunityPost, CommunityComment } from '../../utils/type';

Page({
  data: {
    // 状态栏适配
    statusBarTop: 20,
    safeBottom: 20,
    // 用户信息
    userInfo: null as UserInfo | null,
    // 宠物列表
    petList: [] as PetInfo[],
    // 选中的宠物ID
    selectedPetId: '',
    // 宠物操作弹窗
    petActionVisible: false,
    currentPet: null as PetInfo | null,
    // 内容数量统计
    postCount: 0,
    likeCount: 0,
    commentCount: 0,
    // 脱敏手机号
    maskedPhone: '未绑定手机',
  },

  onLoad() {
    this.initSystemInfo();
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示时刷新数据
    if (this.checkLoginStatus()) {
      this.loadAllData();
    }
  },

  // 初始化系统信息
  initSystemInfo() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - ((sys.safeArea && sys.safeArea.bottom) || sys.screenHeight)) || 0) * 2;
    this.setData({ statusBarTop, safeBottom });
  },

  // ========== P0优先级：登录态强校验 ==========
  checkLoginStatus(): boolean {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      // 未登录，跳转到登录页
      wx.redirectTo({ url: '/pages/login/login' });
      return false;
    }
    const parsed = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
    this.setData({ userInfo: parsed });
    return true;
  },

  // ========== 全链路数据同步 ==========
  async loadAllData() {
    await this.loadUserInfo();
    await this.loadPetList();
    await this.loadContentCounts();
  },

  // 加载用户信息（与注册页、全局数据完全同步）
  async loadUserInfo() {
    try {
      // 优先读取本地storage（包含用户可能修改的数据）
      const storageUserInfo = wx.getStorageSync('userInfo');
      if (storageUserInfo) {
        const userInfo = typeof storageUserInfo === 'string' ? JSON.parse(storageUserInfo) : storageUserInfo;
        // 计算脱敏手机号
        const maskedPhone = userInfo && userInfo.phone ? this.formatPhone(userInfo.phone) : '未绑定手机';
        this.setData({ userInfo, maskedPhone });
      }
    } catch (e) {
      console.error('获取用户信息失败', e);
    }
  },

  // 加载宠物列表（与注册页、首页、记录页双向同步）
  async loadPetList() {
    try {
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
        const petListStorage = wx.getStorageSync('petList');
        if (petListStorage) {
          petList = typeof petListStorage === 'string' ? JSON.parse(petListStorage) : petListStorage;
        }
      }

      // 额外兜底：从userInfo中读取
      if (petList.length === 0) {
        const userInfoStorage = wx.getStorageSync('userInfo');
        if (userInfoStorage) {
          const userInfo = typeof userInfoStorage === 'string' ? JSON.parse(userInfoStorage) : userInfoStorage;
          if (userInfo && userInfo.petList) {
            petList = userInfo.petList;
          }
        }
      }

      // 获取当前选中的宠物ID
      const app = getApp();
      const selectedPetId = app.globalData?.currentPetInfo?.id || (petList.length > 0 ? petList[0].id : '');

      this.setData({
        petList: Array.isArray(petList) ? petList : [],
        selectedPetId
      });
    } catch (e) {
      console.error('获取宠物列表失败', e);
    }
  },

  // 加载内容数量统计（与社区板块实时双向同步）
  async loadContentCounts() {
    try {
      const userInfo = this.data.userInfo;
      if (!userInfo) return;

      // 获取社区帖子
      const communityPosts = wx.getStorageSync('communityPosts') || [];
      const posts = typeof communityPosts === 'string' ? JSON.parse(communityPosts) : communityPosts;
      // 筛选当前用户的帖子
      const myPosts = posts.filter((p: CommunityPost) => p.userId === userInfo.id);

      // 获取用户点赞记录
      const userLikes = wx.getStorageSync('userLikes') || {};
      const likeCount = Object.keys(typeof userLikes === 'object' ? userLikes : {}).length;

      // 获取用户评论记录
      const userComments = wx.getStorageSync('userComments') || [];
      const comments = typeof userComments === 'string' ? JSON.parse(userComments) : userComments;
      const myComments = comments.filter((c: CommunityComment) => c.userId === userInfo.id);

      this.setData({
        postCount: myPosts.length,
        likeCount,
        commentCount: myComments.length
      });
    } catch (e) {
      console.error('加载内容数量失败', e);
    }
  },

  // ========== 模块1：顶部状态栏适配（自动适配） ==========

  // ========== 模块2：个人信息头部卡片交互 ==========
  // 点击头像/编辑资料，跳转到资料编辑页
  goToProfileEdit() {
    wx.navigateTo({
      url: '/pages/profile-edit/profile-edit'
    });
  },

  // 跳转到手机号绑定
  goToPhoneBind() {
    wx.navigateTo({
      url: '/pages/profile-edit/profile-edit?focus=phone'
    });
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.saveAvatar(tempFilePath);
      }
    });
  },

  // 保存头像
  saveAvatar(tempFilePath: string) {
    const userInfo = this.data.userInfo || {} as UserInfo;
    const updatedUserInfo = { ...userInfo, avatarUrl: tempFilePath };

    this.setData({ userInfo: updatedUserInfo });
    wx.setStorageSync('userInfo', updatedUserInfo);

    // 同步更新全局数据
    const app = getApp();
    if (app.globalData) {
      app.globalData.userInfo = updatedUserInfo;
    }

    wx.showToast({ title: '头像设置成功', icon: 'success' });
  },

  // ========== 模块3：宠物管理横向滚动区交互 ==========
  // 点击宠物卡片，弹出操作弹窗
  onPetTap(e: WechatMiniprogram.TouchEvent) {
    const petId = e.currentTarget.dataset.petId;
    const pet = this.data.petList.find(p => p.id === petId) || null;
    this.setData({
      petActionVisible: true,
      currentPet: pet
    });
  },

  // 关闭宠物操作弹窗
  closePetAction() {
    this.setData({
      petActionVisible: false,
      currentPet: null
    });
  },

  // 切换当前宠物
  switchPet() {
    const pet = this.data.currentPet;
    if (!pet) return;

    // 更新全局当前宠物
    const app = getApp();
    if (app.globalData) {
      app.globalData.currentPetInfo = pet;
    }
    this.setData({ selectedPetId: pet.id });
    this.closePetAction();
    wx.showToast({ title: '已切换', icon: 'success' });
  },

  // 编辑宠物信息
  editPet() {
    const pet = this.data.currentPet;
    if (!pet) return;
    this.closePetAction();
    wx.navigateTo({
      url: `/pages/pet-edit/pet-edit?petId=${pet.id}`
    });
  },

  // 删除宠物（二次确认）
  deletePet() {
    const pet = this.data.currentPet;
    if (!pet) return;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除宠物「${pet.petName}」吗？删除后将同步删除该宠物的所有日志、日程和AI报告。`,
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.doDeletePet(pet.id);
        }
      }
    });
  },

  // 执行删除宠物
  doDeletePet(petId: string) {
    try {
      // 删除宠物列表中的该宠物
      let petList = this.data.petList.filter(p => p.id !== petId);
      this.setData({ petList: petList });

      // 更新storage
      wx.setStorageSync('petList', petList);

      // 更新全局数据
      const app = getApp();
      if (app.globalData && app.globalData.userInfo) {
        app.globalData.userInfo.petList = petList;
        app.globalData.petList = petList;
      }

      // 如果删除的是当前选中的宠物，切换到第一个
      if (this.data.selectedPetId === petId && petList.length > 0) {
        this.setData({ selectedPetId: petList[0].id });
        if (app.globalData) {
          app.globalData.currentPetInfo = petList[0];
        }
      }

      this.closePetAction();
      wx.showToast({ title: '删除成功', icon: 'success' });
    } catch (e) {
      console.error('删除宠物失败', e);
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },

  // 点击添加宠物按钮
  addPet() {
    wx.navigateTo({
      url: '/pages/pet-add/pet-add'
    });
  },

  // ========== 模块4：内容与互动核心模块交互 ==========
  // 点击「我的社区帖子」
  goToMyPosts() {
    wx.navigateTo({
      url: '/pages/my-posts/my-posts'
    });
  },

  // 点击「我的点赞」
  goToMyLikes() {
    wx.navigateTo({
      url: '/pages/my-likes/my-likes'
    });
  },

  // 点击「我的评论」
  goToMyComments() {
    wx.navigateTo({
      url: '/pages/my-comments/my-comments'
    });
  },

  // ========== 模块5：系统功能入口区交互 ==========
  // 点击设置项
  onSettingTap(e: WechatMiniprogram.TouchEvent) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({ url });
    }
  },

  // 账号与安全
  goToAccountSecurity() {
    wx.navigateTo({
      url: '/pages/account-security/account-security'
    });
  },

  // 隐私设置
  goToPrivacy() {
    wx.navigateTo({
      url: '/pages/privacy-setting/privacy-setting'
    });
  },

  // 通用设置
  goToGeneralSetting() {
    wx.navigateTo({
      url: '/pages/general-setting/general-setting'
    });
  },

  // 关于我们
  goToAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    });
  },

  // 意见反馈
  goToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  },

  // 联系客服
  contactService() {
    wx.openCustomerServiceChat({
      url: '', // 企业微信客服链接，需要配置
      fail: () => {
        // 兼容：没有配置企业微信时，显示提示
        wx.showModal({
          title: '联系客服',
          content: '如需帮助，请联系我们的客服人员',
          showCancel: false
        });
      }
    });
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？退出后将清除本地登录数据',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.doLogout();
        }
      }
    });
  },

  // 执行退出登录
  doLogout() {
    // 清除本地storage
    wx.clearStorageSync();

    // 清除全局数据
    const app = getApp();
    if (app.globalData) {
      app.globalData.userInfo = null;
      app.globalData.petList = [];
      app.globalData.currentPetInfo = null;
    }

    // 跳转到登录页，禁止返回
    wx.redirectTo({
      url: '/pages/login/login'
    });
  },

  // 空方法占位
  noop() {},

  // ========== WXS方法 ==========
  formatPhone(phone: string): string {
    if (!phone) return '未绑定手机';
    // 手机号脱敏：138****1926
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
});