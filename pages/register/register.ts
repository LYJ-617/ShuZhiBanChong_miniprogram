import { getPetCategoryList, getPetTypeList, getPetBreedList, isControlBreed } from '../../utils/petSpeciesData';

Page({
  data: {
    categoryList: [],
    typeList: [],
    breedList: [],
    categoryIndex: 0,
    typeIndex: 0,
    breedIndex: 0,
    selectedBreed: ''
  },

  onLoad() {
    const categoryList = getPetCategoryList();
    this.setData({ categoryList });
  },

  onCategoryChange(e) {
    const categoryIndex = e.detail.value;
    const category = this.data.categoryList[categoryIndex];
    const typeList = getPetTypeList(category);
    this.setData({
      categoryIndex,
      typeList,
      typeIndex: 0,
      breedList: [],
      breedIndex: 0
    });
  },

  onTypeChange(e) {
    const typeIndex = e.detail.value;
    const type = this.data.typeList[typeIndex];
    const category = this.data.categoryList[this.data.categoryIndex];
    const breedList = getPetBreedList(category, type);
    this.setData({
      typeIndex,
      breedList,
      breedIndex: 0
    });
  },

  onBreedChange(e) {
    const breedIndex = e.detail.value;
    const breed = this.data.breedList[breedIndex];

    if (isControlBreed(breed)) {
      wx.showModal({
        title: '合规提示',
        content: '该品种属于国家管控类动物，请遵守相关法律法规',
        confirmText: '我已知晓',
        success: (res) => {
          if (!res.confirm) {
            this.setData({ breedIndex: 0 });
          } else {
            this.setData({ breedIndex, selectedBreed: breed });
          }
        }
      });
    } else {
      this.setData({ breedIndex, selectedBreed: breed });
    }
  },

  onSubmit() {
    const { categoryList, categoryIndex, typeList, typeIndex, selectedBreed } = this.data;
    const category = categoryList[categoryIndex];
    const type = typeList[typeIndex];

    if (!category || !type || !selectedBreed) {
      wx.showToast({ title: '请完善选择', icon: 'none' });
      return;
    }

    wx.showToast({ title: '注册成功', icon: 'success' });
  }
});