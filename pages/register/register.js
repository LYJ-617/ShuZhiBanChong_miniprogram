import { registerUser } from '../../utils/api.js';
import { 
  getPetCategoryList, 
  getPetTypeList, 
  getPetBreedList, 
  isControlBreed
} from '../../utils/petSpeciesData.js';

Page({
  data: {
    username: '',
    petList: [{
      id: '1',
      petName: '',
      category: '',      // 宠物大类
      type: '',         // 宠物小类  
      breed: '',        // 品种
      gender: '',
      birthday: '',
      personality: '',
      hobby: ''
    }],
    canSubmit: false,
    showPickerVisible: false,
    currentPetIndex: 0,
    
    // Picker数据
    categoryList: [],
    typeList: [],
    breedList: [],
    
    // Picker索引
    pickerIndex: [0, 0, 0],
    
    // 管控提示
    controlBreedWarning: false,
    controlBreedName: ''
  },

  onLoad() {
    this.initPickerData();
    this.checkSubmit();
  },

  initPickerData() {
    const categoryList = getPetCategoryList();
    const firstCategory = categoryList[0] || '';
    const typeList = getPetTypeList(firstCategory);
    const firstType = typeList[0] || '';
    const breedList = getPetBreedList(firstCategory, firstType);
    
    this.setData({
      categoryList,
      typeList,
      breedList
    });
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
    this.checkSubmit();
  },

  onPetNameInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const petList = this.data.petList;
    petList[Number(index)].petName = value;
    this.setData({ petList });
    this.checkSubmit();
  },

  // 打开三级联动选择器
  selectPetType(e) {
    const index = e.currentTarget.dataset.index;
    const pet = this.data.petList[Number(index)];
    
    // 初始化picker索引
    let pickerIndex = [0, 0, 0];
    let typeList = [];
    let breedList = [];
    
    if (pet.category) {
      const categoryIndex = this.data.categoryList.indexOf(pet.category);
      if (categoryIndex >= 0) pickerIndex[0] = categoryIndex;
      typeList = getPetTypeList(pet.category);
      
      if (pet.type) {
        const typeIndex = typeList.indexOf(pet.type);
        if (typeIndex >= 0) pickerIndex[1] = typeIndex;
        breedList = getPetBreedList(pet.category, pet.type);
        
        if (pet.breed) {
          const breedIndex = breedList.indexOf(pet.breed);
          if (breedIndex >= 0) pickerIndex[2] = breedIndex;
        }
      } else {
        breedList = getPetBreedList(pet.category, typeList[0] || '');
      }
    } else {
      typeList = getPetTypeList(this.data.categoryList[0]);
      breedList = getPetBreedList(this.data.categoryList[0], typeList[0]);
    }
    
    this.setData({
      showPickerVisible: true,
      currentPetIndex: Number(index),
      typeList,
      breedList,
      pickerIndex,
      controlBreedWarning: false
    });
  },

  hidePicker() {
    this.setData({ 
      showPickerVisible: false,
      controlBreedWarning: false
    });
  },

  // Picker列变化监听
  onPickerChange(e) {
    const { value } = e.detail;
    const pickerIndex = value;
    const category = this.data.categoryList[pickerIndex[0]];
    const type = this.data.typeList[pickerIndex[1]];
    
    // 获取新的品种列表
    const breedList = getPetBreedList(category, type);
    
    // 确保品种索引不越界
    let newPickerIndex = [...pickerIndex];
    if (newPickerIndex[2] >= breedList.length) {
      newPickerIndex[2] = breedList.length > 0 ? breedList.length - 1 : 0;
    }
    
    // 检查是否选择管控类品种
    const selectedBreed = breedList[newPickerIndex[2]] || '';
    const isControl = isControlBreed(selectedBreed);
    
    this.setData({
      pickerIndex: newPickerIndex,
      typeList: getPetTypeList(category),
      breedList,
      controlBreedWarning: isControl,
      controlBreedName: selectedBreed
    });
  },

  // Picker滚动停止后更新数据
  onPickerColumnChange(e) {
    const { column, value } = e.detail;
    let pickerIndex = [...this.data.pickerIndex];
    pickerIndex[column] = value;
    
    if (column === 0) {
      // 大类变化，重置小类和品种
      const category = this.data.categoryList[value];
      const typeList = getPetTypeList(category);
      const breedList = getPetBreedList(category, typeList[0] || '');
      
      this.setData({
        pickerIndex: [value, 0, 0],
        typeList,
        breedList
      });
    } else if (column === 1) {
      // 小类变化，重置品种
      const category = this.data.categoryList[pickerIndex[0]];
      const type = this.data.typeList[value];
      const breedList = getPetBreedList(category, type);
      
      this.setData({
        pickerIndex: [pickerIndex[0], value, 0],
        breedList
      });
    }
  },

  // 确认选择
  confirmPicker() {
    const { pickerIndex, categoryList, typeList, breedList, currentPetIndex } = this.data;
    const category = categoryList[pickerIndex[0]];
    const type = typeList[pickerIndex[1]];
    const breed = breedList[pickerIndex[2]];
    
    const petList = this.data.petList;
    petList[currentPetIndex].category = category;
    petList[currentPetIndex].type = type;
    petList[currentPetIndex].breed = breed;
    
    this.setData({
      petList,
      showPickerVisible: false,
      controlBreedWarning: false
    });
    
    this.checkSubmit();
  },

  selectPetGender(e) {
    const index = e.currentTarget.dataset.index;
    const gender = e.currentTarget.dataset.gender;
    const petList = this.data.petList;
    if (petList[Number(index)].gender === gender) {
      petList[Number(index)].gender = '';
    } else {
      petList[Number(index)].gender = gender;
    }
    this.setData({ petList });
    this.checkSubmit();
  },

  onPetBirthdayInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const petList = this.data.petList;
    petList[Number(index)].birthday = value;
    this.setData({ petList });
    this.checkSubmit();
  },

  selectPetPersonality(e) {
    const index = e.currentTarget.dataset.index;
    const personality = e.currentTarget.dataset.personality;
    const petList = this.data.petList;
    if (petList[Number(index)].personality === personality) {
      petList[Number(index)].personality = '';
    } else {
      petList[Number(index)].personality = personality;
    }
    this.setData({ petList });
    this.checkSubmit();
  },

  onPetHobbyInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const petList = this.data.petList;
    petList[Number(index)].hobby = value;
    this.setData({ petList });
    this.checkSubmit();
  },

  addPet() {
    const petList = this.data.petList;
    const newPet = {
      id: Date.now().toString(),
      petName: '',
      category: '',
      type: '',
      breed: '',
      gender: '',
      birthday: '',
      personality: '',
      hobby: ''
    };
    petList.push(newPet);
    this.setData({ petList });
    this.checkSubmit();
  },

  removePet(e) {
    const index = e.currentTarget.dataset.index;
    const petList = this.data.petList;
    if (petList.length > 1) {
      petList.splice(Number(index), 1);
      this.setData({ petList });
      this.checkSubmit();
    } else {
      wx.showToast({ title: '至少需要一只宠物', icon: 'none' });
    }
  },

  checkSubmit() {
    if (!this.data.username) {
      this.setData({ canSubmit: false });
      return;
    }
    
    // 检查是否有管控类品种未确认
    const hasUnconfirmedControl = this.data.petList.some(pet => {
      if (pet.breed && isControlBreed(pet.breed)) {
        return true;
      }
      return false;
    });
    
    if (hasUnconfirmedControl) {
      this.setData({ canSubmit: false });
      return;
    }
    
    const canSubmit = this.data.petList.every(pet => {
      return pet.petName && pet.category && pet.type && pet.breed && pet.gender && pet.birthday;
    });
    this.setData({ canSubmit });
  },

  confirmControlBreed() {
    // 用户确认管控类品种，继续提交
    this.setData({ controlBreedWarning: false });
    this.checkSubmit();
  },

  cancelControlBreed() {
    // 用户取消选择，清空品种
    const petList = this.data.petList;
    petList[this.data.currentPetIndex].breed = '';
    this.setData({ 
      petList,
      controlBreedWarning: false,
      controlBreedName: ''
    });
    this.checkSubmit();
  },

  async submitRegister() {
    if (!this.data.canSubmit) return;
    
    // 最终校验
    for (let i = 0; i < this.data.petList.length; i++) {
      const pet = this.data.petList[i];
      if (!pet.petName || !pet.category || !pet.type || !pet.breed || !pet.gender || !pet.birthday) {
        wx.showToast({ title: '请完善宠物信息', icon: 'none' });
        return;
      }
      if (isControlBreed(pet.breed)) {
        wx.showToast({ title: '请确认管控类品种', icon: 'none' });
        return;
      }
    }
    
    const userInfo = {
      username: this.data.username,
      id: Date.now().toString()
    };
    
    try {
      await registerUser(userInfo, this.data.petList);
      wx.showToast({ title: '注册成功', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1500);
    } catch (err) {
      wx.showToast({ title: '注册失败', icon: 'none' });
    }
  }
});