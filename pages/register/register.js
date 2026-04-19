/**
 * 数智伴宠小程序 - 用户+宠物注册页
 * 页面功能：用户完善信息并添加宠物，支持多宠物管理
 */

// 导入宠物分类数据
const petData = require('../../utils/petSpeciesData.js');

Page({
  data: {
    username: '',
    usernameError: '',
    currentPet: {
      id: '',
      petName: '',
      category: '',
      categoryIndex: 0,
      type: '',
      typeIndex: 0,
      breed: '',
      breedIndex: 0,
      gender: '',
      birthday: ''
    },
    petNameError: '',
    categoryList: [],
    currentTypeList: [],
    currentBreedList: [],
    petList: [],
    canSubmit: false,
    showDeleteModal: false,
    deleteIndex: -1,
    editingIndex: -1,
    today: ''
  },

  onLoad() {
    this.initData();
  },

  onShow() {
    // 检查登录态：如果已注册，直接跳转到首页
    const userInfo = wx.getStorageSync('userInfo');
    const petList = wx.getStorageSync('petList') || [];
    if (userInfo && Array.isArray(petList) && petList.length > 0) {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  initData() {
    // 获取今天的日期
    const today = this.formatDate(new Date());
    
    // 初始化宠物大类列表
    const categoryList = petData.getPetCategoryList();
    
    // 生成唯一ID
    const petId = this.generateId();
    
    this.setData({
      today,
      categoryList,
      'currentPet.id': petId
    });
    
    this.checkSubmit();
  },

  // 生成唯一ID
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 用户名输入处理
  onUsernameInput(e) {
    const value = e.detail.value;
    this.setData({ username: value });
    this.validateUsername(value);
    this.checkSubmit();
  },

  // 用户名校验
  validateUsername(value) {
    if (!value) {
      this.setData({ usernameError: '请输入用户名' });
      return false;
    }
    
    if (value.length < 2 || value.length > 10) {
      this.setData({ usernameError: '用户名长度为2-10个字' });
      return false;
    }
    
    // 仅支持中文、英文、数字
    const reg = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
    if (!reg.test(value)) {
      this.setData({ usernameError: '仅支持中文、英文、数字' });
      return false;
    }
    
    this.setData({ usernameError: '' });
    return true;
  },

  // 宠物字段输入处理
  onPetFieldInput(e) {
    const value = e.detail.value;
    this.setData({ 'currentPet.petName': value });
    this.validatePetName(value);
    this.checkSubmit();
  },

  // 宠物名校验
  validatePetName(value) {
    if (!value) {
      this.setData({ petNameError: '' });
      return false;
    }
    
    if (value.length < 2 || value.length > 8) {
      this.setData({ petNameError: '宠物名长度为2-8个字' });
      return false;
    }
    
    // 仅支持中文、英文、数字
    const reg = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
    if (!reg.test(value)) {
      this.setData({ petNameError: '仅支持中文、英文、数字' });
      return false;
    }
    
    this.setData({ petNameError: '' });
    return true;
  },

  // 宠物大类选择变化
  onCategoryChange(e) {
    const index = Number(e.detail.value);
    const category = this.data.categoryList[index];
    
    // 获取小类列表
    const typeList = petData.getPetTypeList(category);
    
    this.setData({
      'currentPet.category': category,
      'currentPet.categoryIndex': index,
      'currentPet.type': '',
      'currentPet.typeIndex': 0,
      'currentPet.breed': '',
      'currentPet.breedIndex': 0,
      currentTypeList: typeList,
      currentBreedList: []
    });
    
    this.checkSubmit();
  },

  // 宠物小类选择变化
  onTypeChange(e) {
    const index = Number(e.detail.value);
    const currentTypeList = this.data.currentTypeList;
    const category = this.data.currentPet.category;
    const type = currentTypeList[index];
    
    if (!type || !category) {
      return;
    }
    
    // 获取品种列表
    let breedList = [];
    try {
      breedList = petData.getPetBreedList(category, type);
    } catch (err) {
      breedList = [];
    }
    
    this.setData({
      'currentPet.type': type,
      'currentPet.typeIndex': index,
      'currentPet.breed': '',
      'currentPet.breedIndex': 0,
      currentBreedList: breedList
    });
    
    this.checkSubmit();
  },

  // 宠物品种选择变化
  onBreedChange(e) {
    const index = Number(e.detail.value);
    
    if (!this.data.currentBreedList || this.data.currentBreedList.length === 0) {
      wx.showToast({ title: '品种列表为空', icon: 'none' });
      return;
    }
    
    const breed = this.data.currentBreedList[index];
    
    this.setData({
      'currentPet.breed': breed,
      'currentPet.breedIndex': index
    });
    
    this.checkSubmit();
  },

  // 宠物性别选择
  onGenderSelect(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({ 'currentPet.gender': gender });
    this.checkSubmit();
  },

  // 宠物生日选择
  onBirthdayChange(e) {
    const birthday = e.detail.value;
    this.setData({ 'currentPet.birthday': birthday });
    this.checkSubmit();
  },

  // 检查提交按钮状态
  checkSubmit() {
    const { username, currentPet, petList } = this.data;
    
    // 检查用户名
    if (!username || this.data.usernameError) {
      this.setData({ canSubmit: false });
      return;
    }
    
    // 检查当前宠物信息是否完整
    const currentPetComplete = currentPet.petName && 
                               currentPet.category && 
                               currentPet.type && 
                               currentPet.breed && 
                               currentPet.gender && 
                               currentPet.birthday;
    
    // 至少要有一只宠物
    const hasPet = petList.length > 0 || currentPetComplete;
    
    // 如果有错误也不允许提交
    if (this.data.petNameError) {
      this.setData({ canSubmit: false });
      return;
    }
    
    this.setData({ canSubmit: hasPet });
  },

  // 添加宠物
  onAddPet() {
    const { currentPet, petList, editingIndex } = this.data;
    
    // 检查当前宠物信息是否完整
    if (!currentPet.petName || !currentPet.category || !currentPet.type || 
        !currentPet.breed || !currentPet.gender || !currentPet.birthday) {
      wx.showToast({
        title: '请完善当前宠物信息',
        icon: 'none'
      });
      return;
    }
    
    // 校验宠物名
    if (!this.validatePetName(currentPet.petName)) {
      return;
    }
    
    // 创建新宠物对象
    const newPet = {
      id: currentPet.id,
      petName: currentPet.petName,
      category: currentPet.category,
      type: currentPet.type,
      breed: currentPet.breed,
      gender: currentPet.gender,
      birthday: currentPet.birthday
    };
    
    let newPetList;
    
    if (editingIndex >= 0) {
      // 编辑模式
      newPetList = [...petList];
      newPetList[editingIndex] = newPet;
      this.setData({ editingIndex: -1 });
    } else {
      // 添加模式
      newPetList = [...petList, newPet];
    }
    
    // 重置当前宠物表单（保留用户名）
    const newPetId = this.generateId();
    this.setData({
      petList: newPetList,
      currentPet: {
        id: newPetId,
        petName: '',
        category: '',
        categoryIndex: 0,
        type: '',
        typeIndex: 0,
        breed: '',
        breedIndex: 0,
        gender: '',
        birthday: ''
      },
      currentTypeList: [],
      currentBreedList: []
    });
    
    this.checkSubmit();
    
    wx.showToast({
      title: editingIndex >= 0 ? '修改成功' : '添加成功',
      icon: 'success'
    });
  },

  // 编辑宠物
  onEditPet(e) {
    const index = e.currentTarget.dataset.index;
    const pet = this.data.petList[index];
    
    // 查找对应的大类、小类索引
    const categoryIndex = this.data.categoryList.indexOf(pet.category);
    const typeList = petData.getPetTypeList(pet.category);
    const typeIndex = typeList.indexOf(pet.type);
    const breedList = petData.getPetBreedList(pet.category, pet.type);
    const breedIndex = breedList.indexOf(pet.breed);
    
    this.setData({
      currentPet: {
        id: pet.id,
        petName: pet.petName,
        category: pet.category,
        categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
        type: pet.type,
        typeIndex: typeIndex >= 0 ? typeIndex : 0,
        breed: pet.breed,
        breedIndex: breedIndex >= 0 ? breedIndex : 0,
        gender: pet.gender,
        birthday: pet.birthday
      },
      currentTypeList: typeList,
      currentBreedList: breedList,
      editingIndex: index
    });
    
    // 滚动到页面顶部
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },

  // 删除宠物 - 显示确认弹窗
  onDeletePet(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      showDeleteModal: true,
      deleteIndex: index
    });
  },

  // 取消删除
  onCancelDelete() {
    this.setData({
      showDeleteModal: false,
      deleteIndex: -1
    });
  },

  // 确认删除
  onConfirmDelete() {
    const { deleteIndex, petList } = this.data;
    
    if (deleteIndex >= 0) {
      const newPetList = [...petList];
      newPetList.splice(deleteIndex, 1);
      
      this.setData({
        petList: newPetList,
        showDeleteModal: false,
        deleteIndex: -1
      });
      
      this.checkSubmit();
      
      // 如果删除后没有宠物了，不允许提交
      if (newPetList.length === 0) {
        this.setData({ canSubmit: false });
      }
    }
  },

  // 阻止事件冒泡
  preventBubble() {},

  // 提交注册
  onSubmit() {
    const { username, petList, currentPet } = this.data;
    
    // 最终校验
    if (!username) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return;
    }
    
    if (!this.validateUsername(username)) {
      return;
    }
    
    // 检查是否有完整宠物
    const hasCompletePet = petList.length > 0 || 
      (currentPet.petName && currentPet.category && currentPet.type && 
       currentPet.breed && currentPet.gender && currentPet.birthday);
    
    if (!hasCompletePet) {
      wx.showToast({ title: '请至少添加一只宠物', icon: 'none' });
      return;
    }
    
    // 如果当前有填写完整的宠物信息，自动添加
    if (currentPet.petName && currentPet.category && currentPet.type && 
        currentPet.breed && currentPet.gender && currentPet.birthday) {
      const newPet = {
        id: currentPet.id,
        petName: currentPet.petName,
        category: currentPet.category,
        type: currentPet.type,
        breed: currentPet.breed,
        gender: currentPet.gender,
        birthday: currentPet.birthday
      };
      petList.push(newPet);
    }
    
    // 保存完整用户数据（含宠物）
    const completeUserInfo = {
      username,
      id: this.generateId(),
      createTime: this.formatDate(new Date()),
      isRegister: true,
      petList
    };

    wx.setStorageSync('userInfo', completeUserInfo);
    wx.setStorageSync('petList', petList);

    // 保存到App全局数据
    const app = getApp();
    app.globalData.userInfo = completeUserInfo;
    app.globalData.petList = petList;

    wx.showToast({
      title: '注册成功',
      icon: 'success',
      duration: 1500
    });

    // Toast结束后切换Tab，避免返回到登录/注册页
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 1500);
  }
});