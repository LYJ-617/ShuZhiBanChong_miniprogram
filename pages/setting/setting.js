Page({
  data: {
    statusBarTop: 20,
    safeBottom: 20,
    nightMode: false,
    
    // 主题设置
    themeMode: 'light',  // light | dark | auto
    
    // 语言设置
    currentLang: 'zh_CN',
    currentLanguage: '简体中文',
    
    // 字体大小
    fontSizeIndex: 2,
    fontSize: 26,
    
    // 通知设置
    pushEnabled: true,
    soundEnabled: true,
    vibrateEnabled: true,
    
    // 存储设置
    storageType: 'local',
    storageLocation: '本地存储',
    cacheSize: '0 KB',
    
    // 版本信息
    version: '1.0.0',
    hasNewVersion: false,
    
    // 弹窗状态
    showLanguageModal: false,
    showStorageModal: false,
    showBackupModal: false,
    showRestoreModal: false,
    showToast: false,
    showLoading: false,
    toastMessage: '',
    toastSuccess: true,
    loadingText: '加载中...',
    
    // 确认弹窗开关
    confirmEnabled: true,
    
    // 搜索功能
    searchKeyword: '',
    showSearchTips: false,
    searchResults: [],
    isSearching: false
  },

  onLoad() {
    this.initSystemInfo();
    this.loadSettings();
  },

  onShow() {
    this.calculateCacheSize();
  },

  onReady() {
    wx.hideShareMenu();
  },

  initSystemInfo() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - ((sys.safeArea && sys.safeArea.bottom) || sys.screenHeight)) || 0) * 2;
    this.setData({ statusBarTop, safeBottom });
  },

  // 加载所有设置
  loadSettings() {
    const settings = wx.getStorageSync('appSettings') || {};
    
    this.setData({
      themeMode: settings.themeMode || 'light',
      currentLang: settings.currentLang || 'zh_CN',
      currentLanguage: this.getLanguageName(settings.currentLang || 'zh_CN'),
      fontSizeIndex: settings.fontSizeIndex || 2,
      fontSize: this.getFontSize(settings.fontSizeIndex || 2),
      pushEnabled: settings.pushEnabled !== false,
      soundEnabled: settings.soundEnabled !== false,
      vibrateEnabled: settings.vibrateEnabled !== false,
      storageType: settings.storageType || 'local',
      storageLocation: settings.storageType === 'cloud' ? '云端同步' : '本地存储',
      confirmEnabled: settings.confirmEnabled !== false,
      nightMode: settings.themeMode === 'dark' || (settings.themeMode === 'auto' && this.checkSystemDarkMode())
    });
  },

  // 保存设置
  saveSettings() {
    const settings = {
      themeMode: this.data.themeMode,
      currentLang: this.data.currentLang,
      fontSizeIndex: this.data.fontSizeIndex,
      pushEnabled: this.data.pushEnabled,
      soundEnabled: this.data.soundEnabled,
      vibrateEnabled: this.data.vibrateEnabled,
      storageType: this.data.storageType,
      confirmEnabled: this.data.confirmEnabled
    };
    wx.setStorageSync('appSettings', settings);
  },

  // ============ 搜索功能 ============
  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    this.setData({ searchKeyword: keyword });
    
    if (keyword) {
      const results = this.searchSettings(keyword);
      this.setData({ 
        searchResults: results,
        showSearchTips: true 
      });
    } else {
      this.setData({ 
        searchResults: [],
        showSearchTips: false 
      });
    }
  },

  onSearchFocus() {
    this.setData({ isSearching: true });
  },

  onSearchBlur() {
    setTimeout(() => {
      this.setData({ isSearching: false });
    }, 300);
  },

  clearSearch() {
    this.setData({ 
      searchKeyword: '',
      searchResults: [],
      showSearchTips: false 
    });
  },

  searchSettings(keyword) {
    const results = [];
    const keywords = keyword.toLowerCase();
    
    // 定义所有可搜索的设置项
    const items = [
      { key: 'theme', name: '主题模式', category: 'appearance' },
      { key: 'language', name: '语言', category: 'appearance' },
      { key: 'font', name: '字体大小', category: 'appearance' },
      { key: 'push', name: '推送通知', category: 'notification' },
      { key: 'sound', name: '声音', category: 'notification' },
      { key: 'vibrate', name: '震动', category: 'notification' },
      { key: 'detail', name: '通知详情设置', category: 'notification' },
      { key: 'security', name: '账号安全', category: 'account' },
      { key: 'privacy', name: '隐私设置', category: 'account' },
      { key: 'storage', name: '存储位置', category: 'storage' },
      { key: 'cache', name: '清除缓存', category: 'storage' },
      { key: 'export', name: '导出数据', category: 'storage' },
      { key: 'backup', name: '备份设置', category: 'backup' },
      { key: 'restore', name: '恢复设置', category: 'backup' },
      { key: 'confirm', name: '操作确认', category: 'backup' },
      { key: 'about', name: '关于我们', category: 'about' },
      { key: 'update', name: '检查更新', category: 'about' }
    ];
    
    items.forEach(item => {
      if (item.name.toLowerCase().includes(keywords) || 
          item.key.toLowerCase().includes(keywords)) {
        results.push(item);
      }
    });
    
    return results;
  },

  isRelatedToSearch(category) {
    if (!this.data.searchKeyword) return false;
    
    const keyword = this.data.searchKeyword.toLowerCase();
    const categoryKeywords = {
      appearance: ['主题', '深色', '浅色', '模式', '外观', '语言', '字体', 'theme', 'font'],
      notification: ['通知', '推送', '消息', '提醒', '声音', '震动', 'notification'],
      account: ['账号', '安全', '密码', '手机', '微信', '隐私', 'account'],
      storage: ['存储', '位置', '本地', '云端', '缓存', '清除', '导出', 'backup'],
      backup: ['备份', '恢复', '确认', '弹窗', 'backup', 'restore'],
      about: ['关于', '更新', '版本', 'about']
    };
    
    return categoryKeywords[category]?.some(k => k.toLowerCase().includes(keyword));
  },

  // ============ 主题切换 ============
  setTheme(e) {
    const mode = e.currentTarget.dataset.mode;
    if (this.data.themeMode === mode) return;
    
    this.setData({ themeMode: mode });
    
    // 应用主题
    if (mode === 'auto') {
      const isDark = this.checkSystemDarkMode();
      this.setData({ nightMode: isDark });
      this.showToast('已切换为跟随系统', true);
    } else if (mode === 'dark') {
      this.setData({ nightMode: true });
      this.showToast('已切换为深色模式', true);
    } else {
      this.setData({ nightMode: false });
      this.showToast('已切换为浅色模式', true);
    }
    
    // 通知所有页面主题变化
    this.notifyThemeChange();
    this.saveSettings();
  },

  checkSystemDarkMode() {
    // 实际应该使用 wx.getSystemInfoAsync 获取系统主题
    return false;
  },

  notifyThemeChange() {
    const pages = getCurrentPages();
    pages.forEach(page => {
      if (page.onThemeChange) {
        page.onThemeChange(this.data.nightMode);
      }
    });
  },

  // ============ 语言选择 ============
  showLanguagePicker() {
    this.setData({ showLanguageModal: true });
  },

  closeLanguageModal() {
    this.setData({ showLanguageModal: false });
  },

  selectLanguage(e) {
    const lang = e.currentTarget.dataset.lang;
    this.setData({
      currentLang: lang,
      currentLanguage: this.getLanguageName(lang),
      showLanguageModal: false
    });
    this.saveSettings();
    this.showToast('语言已切换', true);
  },

  getLanguageName(code) {
    const names = {
      'zh_CN': '简体中文',
      'zh_TW': '繁體中文',
      'en_US': 'English'
    };
    return names[code] || '简体中文';
  },

  // ============ 字体大小 ============
  changeFontSize(e) {
    const index = e.detail.value;
    const fontSize = this.getFontSize(index);
    this.setData({ fontSizeIndex: index, fontSize });
    this.saveSettings();
    this.showToast('字体大小已调整', true);
  },

  getFontSize(index) {
    const sizes = [22, 24, 26, 28, 30];
    return sizes[index] || 26;
  },

  // ============ 通知设置 ============
  togglePush(e) {
    const enabled = e.detail.value;
    this.setData({ pushEnabled: enabled });
    this.saveSettings();
    this.showToast(enabled ? '推送已开启' : '推送已关闭', true);
  },

  toggleSound(e) {
    const enabled = e.detail.value;
    this.setData({ soundEnabled: enabled });
    this.saveSettings();
    this.showToast(enabled ? '声音已开启' : '声音已关闭', true);
  },

  toggleVibrate(e) {
    const enabled = e.detail.value;
    this.setData({ vibrateEnabled: enabled });
    this.saveSettings();
    this.showToast(enabled ? '震动已开启' : '震动已关闭', true);
  },

  goToNotificationDetail() {
    wx.navigateTo({
      url: '/pages/notification-setting/notification-setting'
    });
  },

  // ============ 确认弹窗开关 ============
  toggleConfirm(e) {
    const enabled = e.detail.value;
    this.setData({ confirmEnabled: enabled });
    this.saveSettings();
    this.showToast(enabled ? '操作确认已开启' : '操作确认已关闭', true);
  },

  // ============ 账号与安全 ============
  goToAccountSecurity() {
    wx.navigateTo({
      url: '/pages/account-security/account-security'
    });
  },

  goToPrivacySetting() {
    wx.navigateTo({
      url: '/pages/privacy-setting/privacy-setting'
    });
  },

  // ============ 存储设置 ============
  showStoragePicker() {
    this.setData({ showStorageModal: true });
  },

  closeStorageModal() {
    this.setData({ showStorageModal: false });
  },

  selectStorage(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      storageType: type,
      storageLocation: type === 'cloud' ? '云端同步' : '本地存储',
      showStorageModal: false
    });
    this.saveSettings();
    this.showToast(`已切换为${type === 'cloud' ? '云端同步' : '本地存储'}`, true);
  },

  calculateCacheSize() {
    try {
      const keys = [
        'userInfo', 'petList', 'communityPosts', 'userLikes', 
        'userComments', 'logs', 'appointments', 'orders'
      ];
      let totalSize = 0;
      
      keys.forEach(key => {
        const data = wx.getStorageSync(key);
        if (data) {
          totalSize += JSON.stringify(data).length * 2;
        }
      });

      try {
        const tempSize = wx.getStorageInfoSync().currentSize;
        totalSize += tempSize;
      } catch (e) {}

      let cacheSize = '0 KB';
      if (totalSize > 1024 * 1024) {
        cacheSize = `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
      } else if (totalSize > 1024) {
        cacheSize = `${(totalSize / 1024).toFixed(2)} KB`;
      } else {
        cacheSize = `${totalSize} B`;
      }
      
      this.setData({ cacheSize });
    } catch (e) {
      this.setData({ cacheSize: '0 KB' });
    }
  },

  clearCache() {
    this.handleConfirm('清除缓存', '确定要清除本地缓存数据吗？包括图片缓存、临时文件等', () => {
      wx.showLoading({ title: '清理中...' });
      
      setTimeout(() => {
        try {
          const safeKeys = ['appSettings', 'userInfo'];
          const allKeys = wx.getStorageInfoSync().keys || [];
          allKeys.forEach(key => {
            if (!safeKeys.includes(key)) {
              wx.removeStorageSync(key);
            }
          });
        } catch (e) {}
        
        try {
          wx.getFileSystemManager().rmdirSync({
            dirPath: wx.env.USER_DATA_PATH + '/tmp',
            recursive: true,
            fail: () => {}
          });
        } catch (e) {}
        
        wx.hideLoading();
        this.calculateCacheSize();
        this.showToast('缓存已清理', true);
      }, 800);
    });
  },

  exportData() {
    this.handleConfirm('导出数据', '确定要导出您的个人数据吗？导出的数据包含个人资料、宠物信息、日志等', () => {
      wx.showLoading({ title: '正在导出...' });
      
      setTimeout(() => {
        wx.hideLoading();
        
        const exportData = {
          exportTime: new Date().toISOString(),
          version: '1.0',
          data: {
            settings: wx.getStorageSync('appSettings') || {},
            userInfo: wx.getStorageSync('userInfo') || {},
            petList: wx.getStorageSync('petList') || [],
            logs: wx.getStorageSync('logs') || [],
            posts: wx.getStorageSync('communityPosts') || []
          }
        };
        
        const fileName = `shuzhibanchong_data_${Date.now()}.json`;
        const fileContent = JSON.stringify(exportData, null, 2);
        
        try {
          const fileManager = wx.getFileSystemManager();
          const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
          fileManager.writeFileSync(filePath, fileContent, 'utf8');
          
          wx.showModal({
            title: '导出成功',
            content: `数据已导出到：${fileName}`,
            showCancel: false,
            confirmText: '知道了'
          });
        } catch (e) {
          wx.showToast({ title: '导出失败', icon: 'none' });
        }
      }, 1500);
    });
  },

  // ============ 备份与恢复 ============
  showBackupModal() {
    this.setData({ showBackupModal: true });
  },

  closeBackupModal() {
    this.setData({ showBackupModal: false });
  },

  backupSettings() {
    this.showBackupModal();
  },

  confirmBackup() {
    this.closeBackupModal();
    this.showLoadingModal('正在备份...');
    
    setTimeout(() => {
      // 模拟备份到云端
      const backupData = {
        backupTime: new Date().toISOString(),
        version: this.data.version,
        settings: {
          themeMode: this.data.themeMode,
          currentLang: this.data.currentLang,
          fontSizeIndex: this.data.fontSizeIndex,
          pushEnabled: this.data.pushEnabled,
          soundEnabled: this.data.soundEnabled,
          vibrateEnabled: this.data.vibrateEnabled,
          storageType: this.data.storageType,
          confirmEnabled: this.data.confirmEnabled
        }
      };
      
      // 保存到本地模拟云端备份
      wx.setStorageSync('settingsBackup', backupData);
      
      this.hideLoadingModal();
      this.showToast('设置已备份到云端', true);
    }, 1500);
  },

  showRestoreModal() {
    // 检查是否有备份
    const backup = wx.getStorageSync('settingsBackup');
    if (!backup) {
      wx.showModal({
        title: '无可用备份',
        content: '未找到云端备份，请先进行备份操作',
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }
    
    const backupTime = new Date(backup.backupTime).toLocaleString();
    wx.showModal({
      title: '发现备份',
      content: `检测到 ${backupTime} 的备份，是否恢复？`,
      confirmText: '查看详情',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.setData({ showRestoreModal: true });
        }
      }
    });
  },

  closeRestoreModal() {
    this.setData({ showRestoreModal: false });
  },

  restoreSettings() {
    this.showRestoreModal();
  },

  confirmRestore() {
    this.closeRestoreModal();
    this.showLoadingModal('正在恢复...');
    
    setTimeout(() => {
      const backup = wx.getStorageSync('settingsBackup');
      if (backup && backup.settings) {
        const settings = backup.settings;
        
        this.setData({
          themeMode: settings.themeMode || 'light',
          currentLang: settings.currentLang || 'zh_CN',
          currentLanguage: this.getLanguageName(settings.currentLang || 'zh_CN'),
          fontSizeIndex: settings.fontSizeIndex || 2,
          fontSize: this.getFontSize(settings.fontSizeIndex || 2),
          pushEnabled: settings.pushEnabled !== false,
          soundEnabled: settings.soundEnabled !== false,
          vibrateEnabled: settings.vibrateEnabled !== false,
          storageType: settings.storageType || 'local',
          storageLocation: settings.storageType === 'cloud' ? '云端同步' : '本地存储',
          confirmEnabled: settings.confirmEnabled !== false,
          nightMode: settings.themeMode === 'dark'
        });
        
        this.saveSettings();
        this.notifyThemeChange();
        
        this.hideLoadingModal();
        this.showToast('设置已从云端恢复', true);
      } else {
        this.hideLoadingModal();
        this.showToast('恢复失败，未找到备份数据', false);
      }
    }, 1500);
  },

  // ============ 通用确认处理 ============
  handleConfirm(title, content, onConfirm) {
    if (this.data.confirmEnabled) {
      wx.showModal({
        title: title,
        content: content,
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            onConfirm && onConfirm();
          }
        }
      });
    } else {
      onConfirm && onConfirm();
    }
  },

  showLoadingModal(text = '加载中...') {
    this.setData({ showLoading: true, loadingText: text });
  },

  hideLoadingModal() {
    this.setData({ showLoading: false });
  },

  // ============ 关于 ============
  goToAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    });
  },

  checkUpdate() {
    wx.showLoading({ title: '检查中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      
      const hasNewVersion = this.data.hasNewVersion;
      if (hasNewVersion) {
        wx.showModal({
          title: '发现新版本',
          content: '检测到新版本 v1.1.0，是否立即更新？',
          confirmText: '更新',
          cancelText: '稍后',
          success: (res) => {
            if (res.confirm) {
              wx.showToast({ title: '正在下载...', icon: 'none' });
            }
          }
        });
      } else {
        wx.showToast({
          title: '已是最新版本',
          icon: 'success',
          duration: 2000
        });
      }
    }, 1000);
  },

  // ============ 退出登录 ============
  logout() {
    this.handleConfirm('退出登录', '确定要退出登录吗？', () => {
      wx.showLoading({ title: '退出中...' });
      
      setTimeout(() => {
        wx.clearStorageSync();
        wx.hideLoading();
        
        wx.showToast({
          title: '已退出',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.reLaunch({ url: '/pages/login/login' });
        }, 1000);
      }, 500);
    });
  },

  // ============ Toast提示 ============
  showToast(message, success = true) {
    this.setData({
      showToast: true,
      toastMessage: message,
      toastSuccess: success
    });
    
    setTimeout(() => {
      this.setData({ showToast: false });
    }, 2000);
  },

  // 阻止事件冒泡
  preventBubble() {}
});
