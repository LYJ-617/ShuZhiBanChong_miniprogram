import { getCart, updateCartItemQuantity, removeCartItem, toggleCartItemSelection, toggleAllItemsSelection } from '../../utils/api.js';

Page({
  data: {
    cartItems: [],
    allSelected: false,
    selectedCount: 0,
    selectedTotal: '0.00'
  },

  async onLoad() {
    await this.loadCart();
  },

  async onShow() {
    await this.loadCart();
  },

  async loadCart() {
    try {
      const cartItems = await getCart();
      this.setData({
        cartItems
      });
      this.updateSelectionInfo();
    } catch (err) {
      console.error('加载购物车失败:', err);
    }
  },

  updateSelectionInfo() {
    const selectedItems = this.data.cartItems.filter(item => item.selected);
    const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const selectedTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
    const allSelected = this.data.cartItems.length > 0 && this.data.cartItems.every(item => item.selected);

    this.setData({
      selectedCount,
      selectedTotal,
      allSelected
    });
  },

  async toggleItemSelection(e) {
    const cartItemId = e.currentTarget.dataset.id;
    try {
      const cartItems = await toggleCartItemSelection(cartItemId);
      this.setData({
        cartItems
      });
      this.updateSelectionInfo();
    } catch (err) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  async toggleSelectAll() {
    try {
      const cartItems = await toggleAllItemsSelection(!this.data.allSelected);
      this.setData({
        cartItems
      });
      this.updateSelectionInfo();
    } catch (err) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  async increaseQuantity(e) {
    const cartItemId = e.currentTarget.dataset.id;
    try {
      const cartItems = await updateCartItemQuantity(cartItemId, 1);
      this.setData({
        cartItems
      });
      this.updateSelectionInfo();
    } catch (err) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  async decreaseQuantity(e) {
    const cartItemId = e.currentTarget.dataset.id;
    try {
      const cartItems = await updateCartItemQuantity(cartItemId, -1);
      this.setData({
        cartItems
      });
      this.updateSelectionInfo();
    } catch (err) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  async deleteItem(e) {
    const cartItemId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const cartItems = await removeCartItem(cartItemId);
            this.setData({
              cartItems
            });
            this.updateSelectionInfo();
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          } catch (err) {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  checkout() {
    if (this.data.selectedCount === 0) {
      wx.showToast({
        title: '请先选择商品',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: '/pages/checkout/checkout'
    });
  },

  goToProductDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    });
  },

  goToMall() {
    wx.switchTab({
      url: '/pages/mall/mall'
    });
  }
});
