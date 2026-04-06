Page({
  data: {
    userInfo: null,
    addressList: []
  },

  onLoad() {
    this.loadUserInfo();
    this.loadAddressList();
  },

  onShow() {
    this.loadUserInfo();
    this.loadAddressList();
  },

  loadUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      console.log('profile页面 - 本地存储的userInfo:', userInfo);
      this.setData({ userInfo });
      console.log('profile页面 - setData后的data.userInfo:', this.data.userInfo);
    } catch (e) {
      console.error('获取用户信息失败', e);
    }
  },

  loadAddressList() {
    try {
      const addressList = wx.getStorageSync('addressList') || [];
      this.setData({ addressList });
    } catch (e) {
      console.error('获取地址列表失败', e);
    }
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.saveAvatar(tempFilePath);
      },
      fail: (err) => {
        console.error('选择图片失败', err);
      }
    });
  },

  saveAvatar(tempFilePath) {
    let userInfo = this.data.userInfo || {};
    userInfo = { ...userInfo, avatarUrl: tempFilePath };
    this.setData({ userInfo });
    wx.setStorageSync('userInfo', userInfo);
    wx.showToast({
      title: '头像设置成功',
      icon: 'success'
    });
  },

  editUsername() {
    const currentUsername = this.data.userInfo?.username || '';
    wx.showModal({
      title: '修改用户名',
      editable: true,
      placeholderText: '请输入用户名',
      content: currentUsername,
      success: (res) => {
        console.log('修改用户名结果:', res);
        console.log('res.confirm:', res.confirm);
        console.log('res.content:', res.content);
        console.log('处理后的用户名:', res.content ? res.content.trim() : '');
        if (res.confirm) {
          const username = res.content ? res.content.trim() : '';
          if (username) {
            const userInfo = this.data.userInfo || {};
            const newUserInfo = { ...userInfo, username: username };
            this.setData({ userInfo: newUserInfo });
            wx.setStorageSync('userInfo', newUserInfo);
            console.log('保存后的userInfo:', newUserInfo);
            wx.showToast({
              title: '修改成功',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '用户名不能为空',
              icon: 'none'
            });
          }
        }
      },
      fail: (err) => {
        console.error('弹窗失败', err);
      }
    });
  },

  editPhone() {
    const currentPhone = this.data.userInfo?.phone || '';
    wx.showModal({
      title: '绑定手机号',
      editable: true,
      placeholderText: '请输入手机号',
      content: currentPhone,
      success: (res) => {
        console.log('绑定手机号结果:', res);
        if (res.confirm) {
          const phone = res.content ? res.content.trim() : '';
          if (phone) {
            if (!/^1[3-9]\d{9}$/.test(phone)) {
              wx.showToast({
                title: '请输入正确的手机号',
                icon: 'none'
              });
              return;
            }
            const userInfo = this.data.userInfo || {};
            const newUserInfo = { ...userInfo, phone: phone };
            this.setData({ userInfo: newUserInfo });
            wx.setStorageSync('userInfo', newUserInfo);
            console.log('保存后的userInfo:', newUserInfo);
            wx.showToast({
              title: '绑定成功',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '手机号不能为空',
              icon: 'none'
            });
          }
        }
      },
      fail: (err) => {
        console.error('弹窗失败', err);
      }
    });
  },

  editWechatId() {
    console.log('点击绑定微信');
    wx.showModal({
      title: '绑定微信',
      content: '申请获取您的公开信息（昵称、头像）',
      confirmText: '允许',
      cancelText: '拒绝',
      success: (res) => {
        console.log('授权结果:', res);
        if (res.confirm) {
          wx.getUserProfile({
            desc: '用于完善用户资料',
            success: (userRes) => {
              console.log('获取用户信息成功:', userRes);
              const userInfo = this.data.userInfo || {};
              const newUserInfo = {
                ...userInfo,
                wechatId: userRes.userInfo.nickName,
                avatarUrl: userRes.userInfo.avatarUrl
              };
              this.setData({ userInfo: newUserInfo });
              wx.setStorageSync('userInfo', newUserInfo);
              wx.showToast({
                title: '绑定成功',
                icon: 'success'
              });
            },
            fail: (err) => {
              console.error('获取用户信息失败:', err);
              wx.showToast({
                title: '绑定失败，请重试',
                icon: 'none'
              });
            }
          });
        }
      },
      fail: (err) => {
        console.error('弹窗失败:', err);
      }
    });
  },

  goToMoreInfo() {
    wx.navigateTo({
      url: '/pages/more-info/more-info'
    });
  },

  editAddress(e) {
    const index = e.currentTarget.dataset.index;
    const address = this.data.addressList[index];
    wx.navigateTo({
      url: `/pages/address-edit/address-edit?index=${index}`
    });
  },

  addAddress() {
    wx.navigateTo({
      url: '/pages/address-edit/address-edit'
    });
  }
});
