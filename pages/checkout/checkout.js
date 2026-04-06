import { getSelectedCartItems, createOrder, getDefaultAddress } from '../../utils/api.js';

Page({
  data: {
    address: null,
    selectedItems: [],
    totalAmount: '0.00',
    shippingFee: '0.00',
    discountAmount: '0.00',
    availablePoints: 0,
    usePoints: false,
    pointsDiscount: '0.00',
    finalAmount: '0.00',
    paymentMethod: 'wechat',
    remark: ''
  },

  async onLoad() {
    await this.loadOrderData();
    await this.loadAddress();
  },

  async loadOrderData() {
    try {
      const selectedItems = await getSelectedCartItems();
      const totalAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

      this.setData({
        selectedItems,
        totalAmount,
        finalAmount: totalAmount
      });

      this.calculateFinalAmount();
    } catch (err) {
      console.error('加载订单数据失败:', err);
    }
  },

  async loadAddress() {
    try {
      const address = await getDefaultAddress();
      this.setData({
        address
      });
    } catch (err) {
      console.error('加载地址失败:', err);
    }
  },

  selectAddress() {
    wx.navigateTo({
      url: '/pages/address-list/address-list'
    });
  },

  selectCoupon() {
    wx.showToast({
      title: '优惠券功能开发中',
      icon: 'none'
    });
  },

  togglePoints() {
    this.setData({
      usePoints: !this.data.usePoints
    });
    this.calculateFinalAmount();
  },

  calculateFinalAmount() {
    let shippingFee = '0.00';
    let pointsDiscount = '0.00';

    // 计算运费（满99包邮）
    const total = parseFloat(this.data.totalAmount);
    if (total < 99) {
      shippingFee = '10.00';
    }

    // 计算积分抵扣（100积分抵1元，最多抵扣订单金额的50%）
    if (this.data.usePoints && this.data.availablePoints > 0) {
      const maxPointsDiscount = (total + parseFloat(shippingFee)) * 0.5;
      const pointsValue = this.data.availablePoints / 100;
      pointsDiscount = Math.min(pointsValue, maxPointsDiscount).toFixed(2);
    }

    const finalAmount = (total + parseFloat(shippingFee) - parseFloat(this.data.discountAmount) - parseFloat(pointsDiscount)).toFixed(2);

    this.setData({
      shippingFee,
      pointsDiscount,
      finalAmount: Math.max(0, finalAmount)
    });
  },

  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    });
  },

  selectPayment(e) {
    const method = e.currentTarget.dataset.method;
    this.setData({
      paymentMethod: method
    });
  },

  async submitOrder() {
    if (!this.data.address) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      });
      return;
    }

    if (this.data.selectedItems.length === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      });
      return;
    }

    try {
      const orderData = {
        addressId: this.data.address.id,
        items: this.data.selectedItems,
        totalAmount: this.data.totalAmount,
        shippingFee: this.data.shippingFee,
        discountAmount: this.data.discountAmount,
        pointsDiscount: this.data.pointsDiscount,
        finalAmount: this.data.finalAmount,
        paymentMethod: this.data.paymentMethod,
        remark: this.data.remark
      };

      await createOrder(orderData);

      wx.showToast({
        title: '下单成功',
        icon: 'success',
        duration: 1500
      });

      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/order-detail/order-detail'
        });
      }, 1500);
    } catch (err) {
      wx.showToast({
        title: '下单失败',
        icon: 'none'
      });
    }
  }
});
