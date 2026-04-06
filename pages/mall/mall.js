import { getProducts, getCart, addToCart as apiAddToCart } from '../../utils/api.js';

Page({
  data: {
    products: [],
    filteredProducts: [],
    selectedCategory: '',
    searchKeyword: '',
    sortType: 'default',
    priceOrder: 'desc',
    cart: [],
    cartCount: 0,
    cartTotal: 0
  },

  async onLoad() {
    await this.loadProducts();
    await this.loadCart();
  },

  onPullDownRefresh() {
    this.loadProducts().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadProducts() {
    const products = await getProducts();
    this.setData({
      products,
      filteredProducts: products
    });
  },

  async loadCart() {
    const cart = await getCart();
    this.updateCartData(cart);
  },

  updateCartData(cart) {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
    this.setData({
      cart,
      cartCount,
      cartTotal
    });
  },

  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
    this.filterProducts();
  },

  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      selectedCategory: category
    });
    this.filterProducts();
  },

  setSortType(e) {
    const type = e.currentTarget.dataset.type;

    if (type === 'price' && this.data.sortType === 'price') {
      // 切换价格排序顺序
      const newOrder = this.data.priceOrder === 'asc' ? 'desc' : 'asc';
      this.setData({
        priceOrder: newOrder
      });
    } else {
      this.setData({
        sortType: type,
        priceOrder: 'desc'
      });
    }

    this.filterProducts();
  },

  filterProducts() {
    let filtered = [...this.data.products];

    // 按分类筛选
    if (this.data.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.data.selectedCategory);
    }

    // 按搜索关键词筛选
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword)
      );
    }

    // 排序
    if (this.data.sortType === 'sales') {
      filtered.sort((a, b) => b.sales - a.sales);
    } else if (this.data.sortType === 'price') {
      filtered.sort((a, b) => {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        return this.data.priceOrder === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    this.setData({
      filteredProducts: filtered
    });
  },

  async addToCart(e) {
    const product = e.currentTarget.dataset.product;

    try {
      await apiAddToCart(product);
      wx.showToast({
        title: '已加入购物车',
        icon: 'success',
        duration: 1500
      });
      await this.loadCart();
    } catch (err) {
      wx.showToast({
        title: '加入失败',
        icon: 'none'
      });
    }
  },

  goToProductDetail(e) {
    const product = e.currentTarget.dataset.product;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${product.id}`
    });
  },

  goToCart() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    });
  },

  checkout() {
    wx.navigateTo({
      url: '/pages/checkout/checkout'
    });
  }
});
