const mockPetLogs = [];
const mockAiReports = [];
const mockCommunityPosts = [];
const mockProducts = [];
const mockCart = [];
const mockOrders = [];
const mockFavorites = [];
const mockAddresses = [];

export const registerUser = (userInfo, petList) => {
  return new Promise((resolve) => {
    console.log('api.js registerUser - 保存userInfo:', userInfo);
    console.log('api.js registerUser - 保存petList:', petList);
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('petList', petList);
    console.log('api.js registerUser - 保存完成，验证读取:');
    console.log('api.js registerUser - 验证读取userInfo:', wx.getStorageSync('userInfo'));
    resolve(true);
  });
};

export const getUserInfo = () => {
  return new Promise((resolve) => {
    const userInfo = wx.getStorageSync('userInfo');
    console.log('api.js getUserInfo - 读取的userInfo:', userInfo);
    if (userInfo) {
      resolve(userInfo);
    } else {
      console.log('api.js getUserInfo - userInfo为空，返回null');
      resolve(null);
    }
  });
};

export const getPetList = () => {
  return new Promise((resolve) => {
    const petList = wx.getStorageSync('petList');
    if (petList) {
      resolve(petList);
    } else {
      resolve([]);
    }
  });
};

export const addPetLog = (log) => {
  return new Promise((resolve) => {
    log.id = Date.now().toString();
    log.createTime = new Date().toISOString();
    mockPetLogs.push(log);
    wx.setStorageSync('petLogs', mockPetLogs);
    resolve(true);
  });
};

export const getPetLogs = (petId) => {
  return new Promise((resolve) => {
    const logs = wx.getStorageSync('petLogs');
    let result = logs || mockPetLogs;
    if (petId) {
      result = result.filter((log) => log.petId === petId);
    }
    resolve(result);
  });
};

export const generateAiReport = (petId) => {
  return new Promise((resolve) => {
    const logs = wx.getStorageSync('petLogs');
    const petLogs = logs || mockPetLogs;
    const petLogsForPet = petLogs.filter((log) => log.petId === petId);
    const petList = wx.getStorageSync('petList');
    const petInfo = petList ? petList.find((p) => p.id === petId) : null;

    const report = {
      petId,
      petName: petInfo?.petName || '宠物',
      riskLevel: 'low',
      possibleDiseases: [],
      tips: ['当前宠物状态良好，继续保持哦~']
    };

    const symptoms = [];
    petLogsForPet.forEach(log => {
      if (log.healthInfo) {
        if (log.healthInfo.stool) symptoms.push(log.healthInfo.stool);
        if (log.healthInfo.appetite) symptoms.push(log.healthInfo.appetite);
        if (log.healthInfo.spirit) symptoms.push(log.healthInfo.spirit);
      }
      if (log.content.includes('稀便') || log.content.includes('软便')) symptoms.push('粪便稀软');
      if (log.content.includes('不吃饭') || log.content.includes('食欲差')) symptoms.push('食欲不佳');
      if (log.content.includes('没精神') || log.content.includes('萎靡')) symptoms.push('精神不振');
    });

    const symptomDiseaseMap = {
      '粪便稀软': ['肠胃炎', '消化不良', '寄生虫感染'],
      '粪便干结': ['便秘', '脱水'],
      '食欲不佳': ['肠胃炎', '感冒', '口腔疾病', '全身性疾病'],
      '精神不振': ['感冒', '肠胃炎', '疼痛', '全身性疾病'],
      '掉毛严重': ['皮肤病', '营养缺乏', '季节换毛']
    };

    const possibleDiseases = [];
    symptoms.forEach(symptom => {
      if (symptomDiseaseMap[symptom]) {
        symptomDiseaseMap[symptom].forEach(disease => {
          if (!possibleDiseases.includes(disease)) {
            possibleDiseases.push(disease);
          }
        });
      }
    });

    let riskLevel = 'low';
    if (possibleDiseases.length >= 2) {
      riskLevel = 'medium';
    }
    if (possibleDiseases.length >= 3 || symptoms.includes('精神不振') && symptoms.includes('食欲不佳')) {
      riskLevel = 'high';
    }

    const tips = [];
    if (riskLevel === 'low') {
      tips.push('当前宠物状态良好，继续保持日常的护理和饮食哦~');
    } else if (riskLevel === 'medium') {
      tips.push('宠物可能存在一些健康问题，请注意观察其状态变化，调整饮食和作息');
      if (possibleDiseases.includes('肠胃炎')) {
        tips.push('建议暂时喂食易消化的食物，避免油腻和生冷食物');
      }
      if (possibleDiseases.includes('消化不良')) {
        tips.push('可以尝试喂食益生菌帮助调理肠胃');
      }
    } else if (riskLevel === 'high') {
      tips.push('宠物的健康状况需要重视，建议尽快带往宠物医院进行检查');
      tips.push('请避免自行用药，务必咨询专业兽医的建议');
    }

    const recommendProducts = [];
    const recommendDoctors = [];
    const recommendHospitals = [];
    if (riskLevel === 'medium' || riskLevel === 'high') {
      if (possibleDiseases.includes('肠胃炎') || possibleDiseases.includes('消化不良')) {
        recommendProducts.push('宠物益生菌', '肠胃调理粮');
      }
      recommendDoctors.push('张兽医（擅长内科疾病）', '李兽医（擅长肠胃疾病）');
      recommendHospitals.push('XX宠物医院（距离2km）', 'YY宠物医院（距离1.5km）');
    }

    resolve({
      ...report,
      possibleDiseases: possibleDiseases.slice(0, 4),
      riskLevel,
      tips,
      recommendProducts,
      recommendDoctors,
      recommendHospitals
    });
  });
};

export const getCommunityPosts = (tag) => {
  return new Promise((resolve) => {
    // 优先从本地存储读取
    let result = wx.getStorageSync('communityPosts') || mockCommunityPosts;

    if (tag) {
      result = result.filter(post => post.tags.includes(tag));
    }

    resolve(result);
  });
};

export const addCommunityPost = (post) => {
  return new Promise((resolve) => {
    post.id = Date.now().toString();
    post.createTime = new Date().toISOString();
    post.likeCount = 0;
    post.commentCount = 0;
    post.collectCount = 0;
    post.comments = [];
    mockCommunityPosts.push(post);

    // 保存到本地存储
    const allPosts = wx.getStorageSync('communityPosts') || [];
    allPosts.push(post);
    wx.setStorageSync('communityPosts', allPosts);

    resolve(true);
  });
};

// ========== 商城相关 API ==========
export const getProducts = () => {
  return new Promise((resolve) => {
    // 生成模拟商品数据
    const products = [
      {
        id: '1',
        name: '宠物益生菌 肠胃调理',
        description: '采用进口活性菌种，有效改善宠物肠胃问题，增强免疫力',
        category: '医疗',
        price: 89.00,
        originalPrice: 128.00,
        sales: 5280,
        rating: 4.8,
        image: 'https://via.placeholder.com/300',
        images: ['https://via.placeholder.com/300', 'https://via.placeholder.com/300', 'https://via.placeholder.com/300'],
        specs: ['100g', '200g', '500g'],
        tag: '热销',
        stock: 100,
        detailImages: ['https://via.placeholder.com/600', 'https://via.placeholder.com/600'],
        reviews: [
          {
            id: 'r1',
            username: '爱宠小主',
            avatar: 'https://via.placeholder.com/100',
            time: '2024-01-15',
            rating: 5,
            content: '效果很好，我家狗狗的肠胃问题改善了',
            images: []
          }
        ]
      },
      {
        id: '2',
        name: '天然鸡肉味狗粮',
        description: '优质鸡肉为主要原料，营养均衡，口感佳',
        category: '食品',
        price: 158.00,
        originalPrice: 198.00,
        sales: 3280,
        rating: 4.9,
        image: 'https://via.placeholder.com/300',
        images: ['https://via.placeholder.com/300', 'https://via.placeholder.com/300'],
        specs: ['2kg', '5kg', '10kg'],
        tag: '',
        stock: 200,
        detailImages: ['https://via.placeholder.com/600'],
        reviews: []
      },
      {
        id: '3',
        name: '宠物玩具球',
        description: '耐咬材质，色彩鲜艳，让宠物爱不释手',
        category: '玩具',
        price: 29.90,
        originalPrice: 39.90,
        sales: 8560,
        rating: 4.7,
        image: 'https://via.placeholder.com/300',
        images: ['https://via.placeholder.com/300'],
        specs: ['小号', '中号', '大号'],
        tag: '特价',
        stock: 500,
        detailImages: ['https://via.placeholder.com/600'],
        reviews: []
      },
      {
        id: '4',
        name: '宠物沐浴露',
        description: '温和配方，深层清洁，留香持久',
        category: '用品',
        price: 68.00,
        originalPrice: 88.00,
        sales: 2340,
        rating: 4.6,
        image: 'https://via.placeholder.com/300',
        images: ['https://via.placeholder.com/300', 'https://via.placeholder.com/300'],
        specs: ['500ml', '1L'],
        tag: '',
        stock: 150,
        detailImages: ['https://via.placeholder.com/600'],
        reviews: []
      },
      {
        id: '5',
        name: '宠物驱虫药',
        description: '体内外双重驱虫，安全有效',
        category: '医疗',
        price: 128.00,
        originalPrice: 168.00,
        sales: 4560,
        rating: 4.9,
        image: 'https://via.placeholder.com/300',
        images: ['https://via.placeholder.com/300'],
        specs: ['小型犬', '中型犬', '大型犬'],
        tag: '推荐',
        stock: 80,
        detailImages: ['https://via.placeholder.com/600'],
        reviews: []
      },
      {
        id: '6',
        name: '宠物衣服',
        description: '舒适透气，时尚百搭',
        category: '服饰',
        price: 59.00,
        originalPrice: 79.00,
        sales: 6780,
        rating: 4.5,
        image: 'https://via.placeholder.com/300',
        images: ['https://via.placeholder.com/300', 'https://via.placeholder.com/300'],
        specs: ['S', 'M', 'L', 'XL'],
        tag: '',
        stock: 300,
        detailImages: ['https://via.placeholder.com/600'],
        reviews: []
      }
    ];

    // 保存到本地存储
    const savedProducts = wx.getStorageSync('products');
    if (savedProducts && savedProducts.length > 0) {
      resolve(savedProducts);
    } else {
      wx.setStorageSync('products', products);
      resolve(products);
    }
  });
};

export const getProductById = (id) => {
  return new Promise((resolve, reject) => {
    const products = wx.getStorageSync('products') || [];
    const product = products.find(p => p.id === id);
    if (product) {
      resolve(product);
    } else {
      reject(new Error('商品不存在'));
    }
  });
};

export const getCart = () => {
  return new Promise((resolve) => {
    const cart = wx.getStorageSync('cart') || [];
    resolve(cart);
  });
};

export const addToCart = (product) => {
  return new Promise((resolve, reject) => {
    const cart = wx.getStorageSync('cart') || [];

    // 检查是否已存在相同商品和规格
    const existingItem = cart.find(item =>
      item.id === product.id &&
      (item.spec === product.spec || (!item.spec && !product.spec))
    );

    if (existingItem) {
      existingItem.quantity += product.quantity || 1;
    } else {
      cart.push({
        cartItemId: Date.now().toString(),
        ...product,
        quantity: product.quantity || 1,
        selected: true
      });
    }

    wx.setStorageSync('cart', cart);
    resolve(cart);
  });
};

export const updateCartItemQuantity = (cartItemId, delta) => {
  return new Promise((resolve, reject) => {
    const cart = wx.getStorageSync('cart') || [];
    const item = cart.find(i => i.cartItemId === cartItemId);

    if (item) {
      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        reject(new Error('数量不能小于1'));
        return;
      }
      item.quantity = newQuantity;
      wx.setStorageSync('cart', cart);
      resolve(cart);
    } else {
      reject(new Error('商品不存在'));
    }
  });
};

export const removeCartItem = (cartItemId) => {
  return new Promise((resolve, reject) => {
    const cart = wx.getStorageSync('cart') || [];
    const newCart = cart.filter(i => i.cartItemId !== cartItemId);
    wx.setStorageSync('cart', newCart);
    resolve(newCart);
  });
};

export const toggleCartItemSelection = (cartItemId) => {
  return new Promise((resolve, reject) => {
    const cart = wx.getStorageSync('cart') || [];
    const item = cart.find(i => i.cartItemId === cartItemId);

    if (item) {
      item.selected = !item.selected;
      wx.setStorageSync('cart', cart);
      resolve(cart);
    } else {
      reject(new Error('商品不存在'));
    }
  });
};

export const toggleAllItemsSelection = (selected) => {
  return new Promise((resolve, reject) => {
    const cart = wx.getStorageSync('cart') || [];
    cart.forEach(item => {
      item.selected = selected;
    });
    wx.setStorageSync('cart', cart);
    resolve(cart);
  });
};

export const getSelectedCartItems = () => {
  return new Promise((resolve) => {
    const cart = wx.getStorageSync('cart') || [];
    const selectedItems = cart.filter(item => item.selected);
    resolve(selectedItems);
  });
};

export const toggleFavorite = (productId) => {
  return new Promise((resolve, reject) => {
    const favorites = wx.getStorageSync('favorites') || [];
    const index = favorites.indexOf(productId);

    if (index > -1) {
      favorites.splice(index, 1);
      wx.setStorageSync('favorites', favorites);
      resolve(false);
    } else {
      favorites.push(productId);
      wx.setStorageSync('favorites', favorites);
      resolve(true);
    }
  });
};

export const isProductFavorited = (productId) => {
  return new Promise((resolve) => {
    const favorites = wx.getStorageSync('favorites') || [];
    resolve(favorites.includes(productId));
  });
};

export const createOrder = (orderData) => {
  return new Promise((resolve, reject) => {
    const order = {
      orderId: Date.now().toString(),
      ...orderData,
      status: 'pending',
      createTime: new Date().toISOString()
    };

    const orders = wx.getStorageSync('orders') || [];
    orders.unshift(order);
    wx.setStorageSync('orders', orders);

    // 清空已购买的商品
    const cart = wx.getStorageSync('cart') || [];
    const cartItemIds = orderData.items.map(item => item.cartItemId);
    const newCart = cart.filter(item => !cartItemIds.includes(item.cartItemId));
    wx.setStorageSync('cart', newCart);

    resolve(order);
  });
};

export const getDefaultAddress = () => {
  return new Promise((resolve) => {
    const addresses = wx.getStorageSync('addresses') || [];
    const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
    resolve(defaultAddress || null);
  });
};
