import { PetInfo, PetSchedule } from '../../utils/type';

Page({
  data: {
    // 状态栏适配
    username: '',
    statusBarTop: 20,
    safeBottom: 20,
    // 宠物相关
    petList: [] as PetInfo[],
    petIndex: 0,
    selectedPetId: '',
    selectedPetName: '',
    // 日程相关
    scheduleList: [] as PetSchedule[],
    // 日程添加弹窗
    scheduleModalVisible: false,
    scheduleForm: {
      title: '',
      date: '',
      time: '',
      repeat: 'none' as string,
      reminder: '30min' as string,
      note: ''
    } as any,
    editingSchedule: null as PetSchedule | null,
    // 日程详情弹窗
    scheduleDetailVisible: false,
    currentSchedule: null as PetSchedule | null,
    // 今日日志
    hasTodayLog: false,
    todayLog: null as any
  },

  onLoad() {
    this.initSystemInfo();
    this.checkLoginStatus();
  },

  onShow() {
    // tab切换时同步状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    // 刷新数据
    this.loadPetList();
    this.loadSchedules();
  },

  // 初始化系统信息
  initSystemInfo() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - ((sys.safeArea && sys.safeArea.bottom) || sys.screenHeight)) || 0) * 2;
    this.setData({ statusBarTop, safeBottom });
  },

  // 登录态校验
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.reLaunch({ url: '/pages/login/login' });
      return false;
    }
    const parsed = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
    this.setData({ username: parsed.username || '主人' });
    return true;
  },

  // 加载宠物列表
  loadPetList() {
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

    // 获取当前选中的宠物ID
    const app = getApp();
    let selectedPetId = this.data.selectedPetId;
    
    if (!selectedPetId && petList.length > 0) {
      selectedPetId = app.globalData?.currentPetInfo?.id || petList[0].id;
    }

    this.setData({
      petList: Array.isArray(petList) ? petList : [],
      selectedPetId,
      selectedPetName: petList.find(p => p.id === selectedPetId)?.petName || ''
    });
  },

  // 加载日程列表（与当前宠物绑定）
  loadSchedules() {
    const petId = this.data.selectedPetId;
    if (!petId) {
      this.setData({ scheduleList: [] });
      return;
    }

    try {
      const storage = wx.getStorageSync('petSchedules') || [];
      const schedules = typeof storage === 'string' ? JSON.parse(storage) : storage;

      const now = Date.now();
      const threeDaysLater = now + 3 * 24 * 60 * 60 * 1000;

      // 筛选当前宠物的日程
      let filtered = schedules.filter((s: PetSchedule) => s.petId === petId);

      // 处理过期和未来日程
      const processed = filtered.map(s => {
        const scheduleTime = new Date(s.scheduleTime).getTime();
        const isExpired = scheduleTime < now;
        const isToday = this.isToday(scheduleTime);
        return {
          ...s,
          isExpired,
          isToday,
          displayTime: this.formatScheduleTime(s.scheduleTime)
        };
      });

      // 按时间正序排列：今日 > 未来3天内 > 已过期
      const sorted = processed.sort((a: any, b: any) => {
        // 今日优先
        if (a.isToday && !b.isToday) return -1;
        if (!a.isToday && b.isToday) return 1;
        // 然后按时间排序
        return new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime();
      });

      // 过期日程放最后
      const notExpired = sorted.filter((s: any) => !s.isExpired);
      const expired = sorted.filter((s: any) => s.isExpired);

      this.setData({
        scheduleList: [...notExpired, ...expired].slice(0, 10)
      });
    } catch (e) {
      console.error('加载日程失败', e);
    }
  },

  // 判断是否为今天
  isToday(timestamp: number): boolean {
    const date = new Date(timestamp);
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
  },

  // 格式化日程时间
  formatScheduleTime(timeStr: string): string {
    const date = new Date(timeStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hour}:${minute}`;
  },

  // 切换宠物
  onPetChange(e: WechatMiniprogram.PickerChange) {
    const index = Number(e.detail.value);
    const pet = this.data.petList[index];
    if (!pet) return;

    // 更新全局当前宠物
    const app = getApp();
    if (app.globalData) {
      app.globalData.currentPetInfo = pet;
    }

    this.setData({
      selectedPetId: pet.id,
      selectedPetName: pet.petName,
      petIndex: index
    });

    // 刷新数据
    this.loadSchedules();
    this.loadTodayLog();
  },

  // 加载今日日志
  loadTodayLog() {
    const petId = this.data.selectedPetId;
    if (!petId) return;

    try {
      const logs = wx.getStorageSync('petLogs') || [];
      const parsed = typeof logs === 'string' ? JSON.parse(logs) : logs;
      
      const petLogs = parsed.filter((l: any) => l.petId === petId);
      const sorted = petLogs.sort((a: any, b: any) => 
        new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      );
      const latest = sorted[0];

      this.setData({
        hasTodayLog: !!latest,
        todayLog: latest ? {
          ...latest,
          content: (latest.content || '').slice(0, 50)
        } : null
      });
    } catch (e) {
      console.error('加载日志失败', e);
    }
  },

  // ========== 日程相关功能 ==========

  // 打开添加日程弹窗
  openAddSchedule() {
    const now = new Date();
    const dateStr = this.formatDate(now);
    const timeStr = this.formatTime(now);

    this.setData({
      scheduleModalVisible: true,
      editingSchedule: null,
      scheduleForm: {
        title: '',
        date: dateStr,
        time: timeStr,
        repeat: 'none',
        reminder: '30min',
        note: ''
      }
    });
  },

  // 格式化日期
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 格式化时间
  formatTime(date: Date): string {
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${hour}:${minute}`;
  },

  // 关闭日程弹窗
  closeScheduleModal() {
    this.setData({
      scheduleModalVisible: false,
      editingSchedule: null
    });
  },

  // 日程表单输入
  onScheduleInput(e: WechatMiniprogram.InputEvent) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`scheduleForm.${field}`]: value
    });
  },

  // 日程日期选择
  onDateChange(e: WechatMiniprogram.PickerChange) {
    this.setData({
      'scheduleForm.date': e.detail.value
    });
  },

  // 日程时间选择
  onTimeChange(e: WechatMiniprogram.PickerChange) {
    this.setData({
      'scheduleForm.time': e.detail.value
    });
  },

  // 重复周期选择
  onRepeatChange(e: WechatMiniprogram.PickerChange) {
    const options = ['none', 'daily', 'weekly', 'monthly'];
    this.setData({
      'scheduleForm.repeat': options[e.detail.value]
    });
  },

  // 提醒时间选择
  onReminderChange(e: WechatMiniprogram.PickerChange) {
    const options = ['none', '10min', '30min', '1hour', '1day'];
    this.setData({
      'scheduleForm.reminder': options[e.detail.value]
    });
  },

  // 保存日程
  saveSchedule() {
    const form = this.data.scheduleForm;
    const petId = this.data.selectedPetId;

    // 校验必填项
    if (!form.title.trim()) {
      wx.showToast({ title: '请输入日程标题', icon: 'none' });
      return;
    }
    if (!form.date || !form.time) {
      wx.showToast({ title: '请选择日程时间', icon: 'none' });
      return;
    }
    if (!petId) {
      wx.showToast({ title: '请先选择宠物', icon: 'none' });
      return;
    }

    try {
      // 获取已有日程
      const storage = wx.getStorageSync('petSchedules') || [];
      const schedules = typeof storage === 'string' ? JSON.parse(storage) : storage;

      // 创建新日程
      const userInfo = wx.getStorageSync('userInfo');
      const parsed = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;

      const newSchedule: PetSchedule = {
        id: `schedule_${Date.now()}`,
        petId,
        userId: parsed?.id || '',
        title: form.title.trim(),
        scheduleTime: `${form.date} ${form.time}`,
        repeat: form.repeat as any,
        reminder: form.reminder as any,
        note: form.note || '',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 保存
      schedules.push(newSchedule);
      wx.setStorageSync('petSchedules', schedules);

      this.closeScheduleModal();
      this.loadSchedules();
      wx.showToast({ title: '日程添加成功', icon: 'success' });
    } catch (e) {
      console.error('保存日程失败', e);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  // 点击日程卡片
  onScheduleTap(e: WechatMiniprogram.TouchEvent) {
    const scheduleId = e.currentTarget.dataset.id;
    const schedule = this.data.scheduleList.find(s => s.id === scheduleId);
    if (schedule) {
      this.setData({
        scheduleDetailVisible: true,
        currentSchedule: schedule
      });
    }
  },

  // 关闭日程详情弹窗
  closeScheduleDetail() {
    this.setData({
      scheduleDetailVisible: false,
      currentSchedule: null
    });
  },

  // 删除日程
  deleteSchedule() {
    const schedule = this.data.currentSchedule;
    if (!schedule) return;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条日程吗？删除后无法恢复',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.doDeleteSchedule(schedule.id);
        }
      }
    });
  },

  // 执行删除
  doDeleteSchedule(scheduleId: string) {
    try {
      const storage = wx.getStorageSync('petSchedules') || [];
      const schedules = typeof storage === 'string' ? JSON.parse(storage) : storage;
      
      const filtered = schedules.filter((s: PetSchedule) => s.id !== scheduleId);
      wx.setStorageSync('petSchedules', filtered);

      this.closeScheduleDetail();
      this.loadSchedules();
      wx.showToast({ title: '日程删除成功', icon: 'success' });
    } catch (e) {
      console.error('删除日程失败', e);
    }
  },

  // ========== 其他页面跳转 ==========
  goToWriteLog() {
    wx.switchTab({ url: '/pages/record/record' });
  },

  goToLogDetail() {
    wx.switchTab({ url: '/pages/record/record' });
  },

  goToScheduleAll() {
    wx.navigateTo({
      url: '/pages/schedule-list/schedule-list'
    });
  },

  goToRegister() {
    wx.reLaunch({ url: '/pages/register/register' });
  },

  // 空方法占位
  noop() {}
});