import { CommunityPost, UserInfo } from '../../utils/type';

Page({
  data: {
    // 系统适配
    statusBarTop: 20,
    safeBottom: 20,
    // 用户信息
    userInfo: null as UserInfo | null,
    // 帖子列表
    posts: [] as CommunityPost[],
    leftPosts: [] as CommunityPost[],
    rightPosts: [] as CommunityPost[],
    // 空状态
    isEmpty: true,
    // 统计
    postCount: 0
  },

  onLoad() {
    this.initSystemInfo();
    this.loadUserInfo();
    this.loadMyPosts();
  },

  onShow() {
    this.loadMyPosts();
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

  // 加载我的帖子
  loadMyPosts() {
    const userInfo = this.data.userInfo;
    if (!userInfo) return;

    try {
      // 获取社区帖子
      const storagePosts = wx.getStorageSync('communityPosts') || [];
      const allPosts = typeof storagePosts === 'string' ? JSON.parse(storagePosts) : storagePosts;

      // 筛选当前用户的帖子
      const myPosts = allPosts.filter((p: CommunityPost) => 
        p.userId === userInfo.id
      );

      // 按发布时间倒序
      const sorted = myPosts.sort((a: CommunityPost, b: CommunityPost) => {
        const timeA = new Date(a.createTime || 0).getTime();
        const timeB = new Date(b.createTime || 0).getTime();
        return timeB - timeA;
      });

      // 瀑布流布局
      const split = this.splitColumns(sorted);

      this.setData({
        posts: sorted,
        leftPosts: split.left,
        rightPosts: split.right,
        postCount: sorted.length,
        isEmpty: sorted.length === 0
      });
    } catch (e) {
      console.error('加载帖子失败', e);
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

  // 去发布
  goToPublish() {
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

  // 删除帖子
  deletePost(e: WechatMiniprogram.TouchEvent) {
    const postId = e.currentTarget.dataset.postId;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这篇帖子吗？删除后无法恢复',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.doDeletePost(postId);
        }
      }
    });
  },

  doDeletePost(postId: string) {
    try {
      // 从社区帖子中删除
      const storagePosts = wx.getStorageSync('communityPosts') || [];
      const allPosts = typeof storagePosts === 'string' ? JSON.parse(storagePosts) : storagePosts;
      const filtered = allPosts.filter((p: CommunityPost) => p.id !== postId);
      wx.setStorageSync('communityPosts', filtered);

      this.loadMyPosts();
      wx.showToast({ title: '删除成功', icon: 'success' });
    } catch (e) {
      console.error('删除帖子失败', e);
    }
  },

  noop() {}
});
