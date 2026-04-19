import { CommunityPost, UserInfo } from '../../utils/type';

Page({
  data: {
    // 系统适配
    statusBarTop: 20,
    safeBottom: 20,
    // 用户信息
    userInfo: null as UserInfo | null,
    // 点赞的帖子列表
    posts: [] as CommunityPost[],
    leftPosts: [] as CommunityPost[],
    rightPosts: [] as CommunityPost[],
    // 空状态
    isEmpty: true
  },

  onLoad() {
    this.initSystemInfo();
    this.loadUserInfo();
    this.loadMyLikes();
  },

  initSystemInfo() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - ((sys.safeArea && sys.safeArea.bottom) || sys.screenHeight)) || 0) * 2;
    this.setData({ statusBarTop, safeBottom });
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      const parsed = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
      this.setData({ userInfo: parsed });
    }
  },

  // 加载我点赞的帖子
  loadMyLikes() {
    const userInfo = this.data.userInfo;
    if (!userInfo) return;

    try {
      // 获取用户点赞记录
      const userLikes = wx.getStorageSync('userLikes') || {};
      const likedPosts = typeof userLikes === 'object' ? userLikes : {};
      const likedPostIds = Object.keys(likedPosts);

      if (likedPostIds.length === 0) {
        this.setData({ isEmpty: true, posts: [] });
        return;
      }

      // 获取社区帖子
      const storagePosts = wx.getStorageSync('communityPosts') || [];
      const allPosts = typeof storagePosts === 'string' ? JSON.parse(storagePosts) : storagePosts;

      // 筛选点赞的帖子
      const likedPostsList = allPosts.filter((p: CommunityPost) => 
        likedPostIds.includes(p.id)
      );

      // 按点赞时间倒序（使用用户点赞记录的时间）
      const sorted = likedPostsList.sort((a: CommunityPost, b: CommunityPost) => {
        const timeA = likedPosts[a.id] || 0;
        const timeB = likedPosts[b.id] || 0;
        return timeB - timeA;
      });

      // 瀑布流布局
      const split = this.splitColumns(sorted);

      this.setData({
        posts: sorted,
        leftPosts: split.left,
        rightPosts: split.right,
        isEmpty: sorted.length === 0
      });
    } catch (e) {
      console.error('加载点赞失败', e);
    }
  },

  // 瀑布流分列
  splitColumns(posts: CommunityPost[]) {
    const left: CommunityPost[] = [];
    const right: CommunityPost[] = [];
    let leftHeight = 0;
    let rightHeight = 0;

    posts.forEach((p, idx) => {
      const titleLen = (p.content || '').slice(0, 30).length;
      const estimated = 240 + Math.min(80, titleLen * 2) + (idx % 3) * 18;
      
      if (leftHeight <= rightHeight) {
        left.push(p);
        leftHeight += estimated;
      } else {
        right.push(p);
        rightHeight += estimated;
      }
    });

    return { left, right };
  },

  // 去逛逛（跳转到社区）
  goToCommunity() {
    wx.switchTab({
      url: '/pages/community/community'
    });
  },

  // 预览图片
  previewImage(e: WechatMiniprogram.TouchEvent) {
    const postId = e.currentTarget.dataset.postId;
    const image = e.currentTarget.dataset.image;
    const post = this.data.posts.find(p => p.id === postId);
    if (!post || !post.images) return;
    
    wx.previewImage({
      current: image,
      urls: post.images
    });
  },

  // 取消点赞
  unlikePost(e: WechatMiniprogram.TouchEvent) {
    const postId = e.currentTarget.dataset.postId;

    wx.showModal({
      title: '取消点赞',
      content: '确定要取消点赞吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.doUnlike(postId);
        }
      }
    });
  },

  doUnlike(postId: string) {
    try {
      // 更新用户点赞记录
      const userLikes = wx.getStorageSync('userLikes') || {};
      const likedPosts = typeof userLikes === 'object' ? userLikes : {};
      delete likedPosts[postId];
      wx.setStorageSync('userLikes', likedPosts);

      // 更新帖子点赞数
      const storagePosts = wx.getStorageSync('communityPosts') || [];
      const allPosts = typeof storagePosts === 'string' ? JSON.parse(storagePosts) : storagePosts;
      const idx = allPosts.findIndex((p: CommunityPost) => p.id === postId);
      if (idx !== -1) {
        allPosts[idx].likeCount = Math.max(0, (allPosts[idx].likeCount || 1) - 1);
        wx.setStorageSync('communityPosts', allPosts);
      }

      this.loadMyLikes();
      wx.showToast({ title: '已取消点赞', icon: 'success' });
    } catch (e) {
      console.error('取消点赞失败', e);
    }
  },

  noop() {}
});