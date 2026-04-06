import { registerUser } from '../../utils/api';
import { PetInfo, UserInfo } from '../../utils/type';

Page({
  data: {
    username: '',
    petList: [{
      id: '1',
      petName: '',
      type: '',
      breed: '',
      gender: '',
      birthday: '',
      personality: '',
      hobby: ''
    } as PetInfo],
    canSubmit: false
  },

  onLoad() {
    this.checkSubmit();
  },

  onUsernameInput(e: WechatMiniprogram.InputEvent) {
    this.setData({
      username: e.detail.value
    });
    this.checkSubmit();
  },

  onPetNameInput(e: WechatMiniprogram.InputEvent) {
    const index = e.currentTarget.dataset.index as string;
    const value = e.detail.value;
    const petList = this.data.petList;
    petList[Number(index)].petName = value;
    this.setData({
      petList
    });
    this.checkSubmit();
  },

  selectPetType(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index as string;
    const type = e.currentTarget.dataset.type as string;
    const petList = this.data.petList;
    petList[Number(index)].type = type;
    this.setData({
      petList
    });
    this.checkSubmit();
  },

  selectPetBreed(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index as string;
    const breed = e.currentTarget.dataset.breed as string;
    const petList = this.data.petList;
    petList[Number(index)].breed = breed;
    this.setData({
      petList
    });
    this.checkSubmit();
  },

  selectPetGender(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index as string;
    const gender = e.currentTarget.dataset.gender as string;
    const petList = this.data.petList;
    petList[Number(index)].gender = gender;
    this.setData({
      petList
    });
    this.checkSubmit();
  },

  onPetBirthdayInput(e: WechatMiniprogram.InputEvent) {
    const index = e.currentTarget.dataset.index as string;
    const value = e.detail.value;
    const petList = this.data.petList;
    petList[Number(index)].birthday = value;
    this.setData({
      petList
    });
    this.checkSubmit();
  },

  selectPetPersonality(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index as string;
    const personality = e.currentTarget.dataset.personality as string;
    const petList = this.data.petList;
    petList[Number(index)].personality = personality;
    this.setData({
      petList
    });
  },

  selectPetHobby(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index as string;
    const hobby = e.currentTarget.dataset.hobby as string;
    const petList = this.data.petList;
    petList[Number(index)].hobby = hobby;
    this.setData({
      petList
    });
  },

  addPet() {
    const petList = this.data.petList;
    const newPet: PetInfo = {
      id: (Date.now()).toString(),
      petName: '',
      type: '',
      breed: '',
      gender: '',
      birthday: '',
      personality: '',
      hobby: ''
    };
    petList.push(newPet);
    this.setData({
      petList
    });
    this.checkSubmit();
  },

  removePet(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index as string;
    const petList = this.data.petList;
    if (petList.length > 1) {
      petList.splice(Number(index), 1);
      this.setData({
        petList
      });
      this.checkSubmit();
    } else {
      wx.showToast({
        title: '至少需要一只宠物',
        icon: 'none'
      });
    }
  },

  checkSubmit() {
    if (!this.data.username) {
      this.setData({ canSubmit: false });
      return;
    }
    const canSubmit = this.data.petList.every(pet => {
      return pet.petName && pet.type && pet.breed && pet.gender && pet.birthday;
    });
    this.setData({ canSubmit });
  },

  async submitRegister() {
    if (!this.data.canSubmit) return;
    const userInfo: UserInfo = {
      username: this.data.username,
      id: Date.now().toString()
    };
    try {
      await registerUser(userInfo, this.data.petList);
      wx.showToast({
        title: '注册成功',
        icon: 'success'
      });
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    } catch (err) {
      wx.showToast({
        title: '注册失败',
        icon: 'none'
      });
    }
  }
});