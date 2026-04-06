Page({
  data: {
    index: -1,
    formData: {
      name: '',
      phone: '',
      region: '',
      detail: '',
      isDefault: false
    }
  },

  onLoad(options) {
    const index = options.index ? parseInt(options.index) : -1;
    this.setData({ index });

    if (index >= 0) {
      this.loadAddress(index);
    }
  },

  loadAddress(index) {
    try {
      const addressList = wx.getStorageSync('addressList') || [];
      if (addressList[index]) {
        this.setData({
          formData: addressList[index]
        });
      }
    } catch (e) {
      console.error('加载地址失败', e);
    }
  },

  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    });
  },

  onPhoneInput(e) {
    this.setData({
      'formData.phone': e.detail.value
    });
  },

  selectRegion() {
    wx.showModal({
      title: '选择省市区',
      editable: true,
      placeholderText: '请输入省市区，如：北京市朝阳区',
      content: this.data.formData.region || '',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            'formData.region': res.content
          });
        }
      }
    });
  },

  onDetailInput(e) {
    this.setData({
      'formData.detail': e.detail.value
    });
  },

  onDefaultChange(e) {
    this.setData({
      'formData.isDefault': e.detail.value
    });
  },

  validateForm() {
    const { name, phone, region, detail } = this.data.formData;

    if (!name) {
      wx.showToast({
        title: '请输入收货人姓名',
        icon: 'none'
      });
      return false;
    }

    if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return false;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return false;
    }

    if (!region) {
      wx.showToast({
        title: '请选择省市区',
        icon: 'none'
      });
      return false;
    }

    if (!detail) {
      wx.showToast({
        title: '请输入详细地址',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  saveAddress() {
    if (!this.validateForm()) {
      return;
    }

    try {
      let addressList = wx.getStorageSync('addressList') || [];
      const formData = { ...this.data.formData };

      if (formData.isDefault) {
        addressList = addressList.map(addr => ({ ...addr, isDefault: false }));
      }

      if (this.data.index >= 0) {
        addressList[this.data.index] = formData;
      } else {
        formData.id = Date.now().toString();
        addressList.push(formData);
      }

      wx.setStorageSync('addressList', addressList);
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (e) {
      console.error('保存地址失败', e);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  }
});
