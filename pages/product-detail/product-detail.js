import { getProductById, getCart, addToCart as apiAddToCart, toggleFavorite, isProductFavorited } from '../../utils/api.js';

Page({
  data: {
    productId: '',
    product: {},
    selectedSpec: '',
    quantity: 1,
    isFavorited: false,
    cartCount: 0,
    showSpecModal: false
  },

  async onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({
        productId: id
      });
      await this.loadProductDetail(id);
      await this.checkFavoriteStatus(id);
      await this.loadCartCount();
    }
  },

  async loadProductDetail(id) {
    try {
      const product = await getProductById(id);
      this.setData({
        product,
        selectedSpec: product.specs && product.specs.length > 0 ? product.specs[0] : ''
      });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  async checkFavoriteStatus(productId) {
    const favorited = await isProductFavorited(productId);
    this.setData({
      isFavorited: favorited
    });
  },

  async loadCartCount() {
    const cart = await getCart();
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    this.setData({
      cartCount
    });
  },

  selectSpec(e) {
    const spec = e.currentTarget.dataset.spec;
    this.setData({
      selectedSpec: spec
    });
  },

  decreaseQuantity() {
    if (this.data.quantity > 1) {
      this.setData({
        quantity: this.data.quantity - 1
      });
    }
  },

  increaseQuantity() {
    this.setData({
      quantity: this.data.quantity + 1
    });
  },

  async toggleFavorite() {
    try {
      const newStatus = await toggleFavorite(this.data.productId);
      this.setData({
        isFavorited: newStatus
      });
      wx.showToast({
        title: newStatus ? '已收藏' : '已取消收藏',
        icon: 'success'
      });
    } catch (err) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  showSpecModal() {
    this.setData({
      showSpecModal: true
    });
  },

  hideSpecModal() {
    this.setData({
      showSpecModal: false
    });
  },

  confirmSpec() {
    this.hideSpecModal();
  },

  async addToCart() {
    if (this.data.product.specs && this.data.product.specs.length > 0 && !this.data.selectedSpec) {
      this.showSpecModal();
      return;
    }

    const cartItem = {
      ...this.data.product,
      spec: this.data.selectedSpec,
      quantity: this.data.quantity
    };

    try {
      await apiAddToCart(cartItem);
      wx.showToast({
        title: '已加入购物车',
        icon: 'success',
        duration: 1500
      });
      await this.loadCartCount();
    } catch (err) {
      wx.showToast({
        title: '加入失败',
        icon: 'none'
      });
    }
  },

  buyNow() {
    this.addToCart().then(() => {
      wx.navigateTo({
        url: '/pages/checkout/checkout'
      });
    });
  },

  goToCart() {
    wx.switchTab({
      url: '/pages/cart/cart'
    });
  },

  goToReviews() {
    wx.showToast({
      title: '评价列表开发中',
      icon: 'none'
    });
  }
});
