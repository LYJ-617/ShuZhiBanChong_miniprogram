import { CommunityPost, UserInfo } from '../../utils/type';

interface CommunityComment {
  id: string;
  userId: string;
  username: string;
  content: string;
  likeCount: number;
  createTime: string;
}

interface CommunityPostExt extends CommunityPost {
  imageHeight?: number;
  comments?: CommunityComment[];
}

const TABS = ['全部', '精选', '日常记录', '好物分享'];
const PAGE_SIZE = 10;

Page({
  data: {
    statusBarTop: 20,
    safeBottom: 20,
    fabBottom: 120,
    fabBottomStyle: '',
    // P1优先级：控制FAB按钮显示/隐藏
    fabVisible: true,
    tabs: TABS,
    selectedTag: '全部',
    searchKeyword: '',
    userInfo: null as UserInfo | null,
    publishModalVisible: false,
    currentPostData: {} as Partial<CommunityPostExt>,
    allPosts: [] as CommunityPostExt[],
    renderPosts: [] as CommunityPostExt[],
    leftPosts: [] as CommunityPostExt[],
    rightPosts: [] as CommunityPostExt[],
    page: 1,
    hasMore: true,
    loading: false,
    commentVisible: false,
    currentPost: null as CommunityPostExt | null,
    commentInput: '',
    likedPostId: '',
    likeAnimating: false,
    // 用户点赞记录：{postId: boolean}
    userLikes: {} as Record<string, boolean>,
    // 评论编辑相关
    isEditingComment: false,
    editingCommentId: '',
    editingCommentContent: ''
  },

  onLoad() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    // 计算底部安全边距（rpx）
    const safeBottomRpx = ((sys.screenHeight - (sys.safeArea?.bottom || sys.screenHeight)) || 0) * 2;
    this.setData({ statusBarTop, safeBottom: safeBottomRpx });
    // 设置CSS变量供fab使用：bottom = 安全边距 + TabBar(100rpx) + 20rpx
    const fabBottom = safeBottomRpx + 120;
    this.setData({ fabBottom });
    // 使用页面样式设置CSS变量
    const query = wx.createSelectorQuery();
    query.select('.community-page').boundingClientRect((rect) => {
      if (rect) {
        this.setData({
          fabBottomStyle: `bottom: ${fabBottom}rpx`
        });
      }
    }).exec();
    this.initUserInfo();
    this.loadUserLikes();
    this.loadPosts(true);
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
  },

  onPullDownRefresh() {
    this.loadPosts(true).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    this.loadMore();
  },

  initUserInfo() {
    const raw = wx.getStorageSync('userInfo');
    if (!raw) return;
    const userInfo = typeof raw === 'string' ? JSON.parse(raw) : raw;
    this.setData({ userInfo });
  },

  getStoragePosts(): CommunityPostExt[] {
    try {
      const raw = wx.getStorageSync('communityPosts');
      const posts = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
      if (Array.isArray(posts) && posts.length > 0) return posts;
    } catch (e) {
      console.log('读取社区帖子失败', e);
    }
    return this.getSeedPosts();
  },

  setStoragePosts(posts: CommunityPostExt[]) {
    wx.setStorageSync('communityPosts', posts);
  },

  getSeedPosts(): CommunityPostExt[] {
    const now = Date.now();
    const mk = (i: number, tag: string): CommunityPostExt => ({
      id: `seed_${i}`,
      userId: `u_${i}`,
      username: ['小爪爪', '猫系日常', '狗狗研究所', '萌宠星球'][i % 4],
      userAvatar: '',
      content: `今天分享毛孩子的${tag}，状态超棒，记录一下～`,
      tags: [tag],
      images: ['/static/images/default-avatar.png'],
      createTime: new Date(now - i * 3600 * 1000).toISOString(),
      likeCount: 10 + i,
      commentCount: 0,
      collectCount: 0,
      comments: []
    });
    return [
      mk(1, '日常记录'),
      mk(2, '好物分享'),
      mk(3, '精选'),
      mk(4, '日常记录'),
      mk(5, '好物分享'),
      mk(6, '精选')
    ];
  },

  async loadPosts(reset = false) {
    if (this.data.loading) return;
    this.setData({ loading: true });
    const all = this.getStoragePosts().filter(post => {
      const publishTo = (post as any).publishTo;
      if (!publishTo) return true;
      return Array.isArray(publishTo) && publishTo.includes('community');
    });
    const filtered = all.filter(post => {
      const tagOK = this.data.selectedTag === '全部' || post.tags.includes(this.data.selectedTag);
      const keyword = this.data.searchKeyword.trim();
      const keywordOK = !keyword || post.content.includes(keyword) || post.username.includes(keyword);
      return tagOK && keywordOK;
    });
    const page = reset ? 1 : this.data.page;
    const renderPosts = filtered.slice(0, page * PAGE_SIZE);
    const split = this.splitColumns(renderPosts);
    this.setData({
      allPosts: filtered,
      renderPosts,
      leftPosts: split.left,
      rightPosts: split.right,
      page,
      hasMore: renderPosts.length < filtered.length,
      loading: false
    });
  },

  splitColumns(posts: CommunityPostExt[]) {
    const left: CommunityPostExt[] = [];
    const right: CommunityPostExt[] = [];
    let leftHeight = 0;
    let rightHeight = 0;
    posts.forEach((p, idx) => {
      const titleLen = (p.content || '').slice(0, 30).length;
      const estimated = 240 + Math.min(80, titleLen * 2) + (idx % 3) * 18;
      if (leftHeight <= rightHeight) {
        left.push({ ...p, imageHeight: estimated });
        leftHeight += estimated;
      } else {
        right.push({ ...p, imageHeight: estimated });
        rightHeight += estimated;
      }
    });
    return { left, right };
  },

  selectTag(e: WechatMiniprogram.TouchEvent) {
    const tag = String(e.currentTarget.dataset.tag || '全部');
    this.setData({
      selectedTag: tag,
      page: 1
    });
    this.loadPosts(true);
  },

  onSearchInput(e: WechatMiniprogram.InputEvent) {
    this.setData({
      searchKeyword: e.detail.value || '',
      page: 1
    });
    this.loadPosts(true);
  },

  loadMore() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ page: this.data.page + 1 });
    this.loadPosts(false);
  },

  showPublishModal() {
    this.setData({ publishModalVisible: true });
    // 重置标签状态
    const publishComponent = this.selectComponent('.publish-component');
    if (publishComponent && publishComponent.resetTags) {
      publishComponent.resetTags();
    }
  },

  hidePublishModal() {
    // 重置标签状态
    const publishComponent = this.selectComponent('.publish-component');
    if (publishComponent && publishComponent.resetTags) {
      publishComponent.resetTags();
    }
    
    this.setData({
      publishModalVisible: false,
      currentPostData: {}
    });
  },

  onPostDataChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({
      currentPostData: e.detail || {}
    });
  },

  submitPost() {
    const draft = this.data.currentPostData;
    if (!draft.content || !Array.isArray(draft.tags) || draft.tags.length === 0) {
      wx.showToast({ title: '请至少选择1个话题标签', icon: 'none' });
      return;
    }
    if (!draft.content || !draft.content.trim()) {
      wx.showToast({ title: '请填写帖子内容', icon: 'none' });
      return;
    }
    const post: CommunityPostExt = {
      id: `post_${Date.now()}`,
      userId: this.data.userInfo?.id || 'guest',
      username: this.data.userInfo?.username || '匿名用户',
      userAvatar: this.data.userInfo?.avatarUrl || this.data.userInfo?.avatar || '',
      content: draft.content,
      tags: draft.tags,
      images: draft.images || [],
      createTime: new Date().toISOString(),
      likeCount: 0,
      commentCount: 0,
      collectCount: 0,
      comments: []
    };
    const all = this.getStoragePosts();
    all.unshift(post);
    this.setStoragePosts(all);
    wx.showToast({ title: '发布成功', icon: 'success' });
    this.hidePublishModal();
    this.loadPosts(true);
  },

  onPostTap(e: WechatMiniprogram.TouchEvent) {
    const postId = String(e.currentTarget.dataset.postId);
    if (!postId) return;
    
    const now = Date.now();
    const map = (this as any)._tapMap || {};
    const last = map[postId] || 0;
    map[postId] = now;
    (this as any)._tapMap = map;
    
    if (now - last < 300) {
      this.likePostById(postId, true);
      return;
    }
    
    setTimeout(() => {
      const current = ((this as any)._tapMap || {})[postId];
      if (current === now) {
        this.openComments(postId);
      }
    }, 320);
  },

  likePostById(postId: string, animate = false) {
    const all = this.getStoragePosts();
    const idx = all.findIndex(p => p.id === postId);
    if (idx === -1) return;
    all[idx].likeCount += 1;
    this.setStoragePosts(all);
    this.setData({
      likedPostId: postId,
      likeAnimating: animate
    });
    this.loadPosts(false);
    if (animate) {
      setTimeout(() => {
        this.setData({ likedPostId: '', likeAnimating: false });
      }, 800);
    }
  },

  previewImage(e: WechatMiniprogram.TouchEvent) {
    // 阻止事件冒泡，防止触发卡片点击
    e.stopPropagation && e.stopPropagation();
    
    const postId = String(e.currentTarget.dataset.postId);
    const image = String(e.currentTarget.dataset.image);
    
    // 从存储中获取帖子数据
    const post = this.getStoragePosts().find(p => p.id === postId);
    
    // 验证数据完整性
    if (!post) {
      console.error('Preview failed: Post not found', postId);
      wx.showToast({ title: '图片加载失败', icon: 'none' });
      return;
    }
    
    if (!post.images || post.images.length === 0) {
      console.error('Preview failed: No images in post', postId);
      wx.showToast({ title: '暂无图片', icon: 'none' });
      return;
    }
    
    // 验证当前图片是否在图片列表中
    const currentIndex = post.images.indexOf(image);
    const current = currentIndex > -1 ? image : post.images[0];
    
    // 过滤掉无效的图片URL
    const validImages = post.images.filter(img => img && typeof img === 'string' && img.length > 0);
    
    if (validImages.length === 0) {
      console.error('Preview failed: No valid images', postId);
      wx.showToast({ title: '图片加载失败', icon: 'none' });
      return;
    }
    
    // 调用微信图片预览API
    wx.previewImage({
      current: current,
      urls: validImages,
      success: () => {
        console.log('Image preview opened successfully');
      },
      fail: (err) => {
        console.error('Image preview failed:', err);
        wx.showToast({ title: '图片预览失败', icon: 'none' });
      }
    });
  },

  openComments(postId: string) {
    const post = this.getStoragePosts().find(p => p.id === postId) || null;
    if (!post) return;
    this.setData({
      currentPost: post,
      commentVisible: true,
      commentInput: '',
      // P1优先级：打开评论弹窗时隐藏FAB按钮，防止层级遮挡
      fabVisible: false
    });
  },

  closeComments() {
    this.setData({
      commentVisible: false,
      currentPost: null,
      commentInput: '',
      // P1优先级：关闭评论弹窗时恢复显示FAB按钮
      fabVisible: true
    });
  },

  onCommentInput(e: WechatMiniprogram.InputEvent) {
    this.setData({
      commentInput: e.detail.value || ''
    });
  },

  submitComment() {
    const post = this.data.currentPost;
    const content = this.data.commentInput.trim();
    if (!post) return;
    if (!content) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }
    const all = this.getStoragePosts();
    const idx = all.findIndex(p => p.id === post.id);
    if (idx === -1) return;
    
    if (this.data.isEditingComment) {
      // 编辑评论
      const comments = all[idx].comments || [];
      const cIdx = comments.findIndex(c => c.id === this.data.editingCommentId);
      if (cIdx === -1) return;
      comments[cIdx].content = content;
      all[idx].comments = comments;
      this.setStoragePosts(all);
      this.setData({
        currentPost: all[idx],
        commentInput: '',
        isEditingComment: false,
        editingCommentId: ''
      });
      wx.showToast({ title: '评论已修改', icon: 'success', duration: 1500 });
    } else {
      // 发布新评论
      const newComment: CommunityComment = {
        id: `c_${Date.now()}`,
        userId: this.data.userInfo?.id || 'guest',
        username: this.data.userInfo?.username || '匿名用户',
        userAvatar: this.data.userInfo?.avatarUrl || this.data.userInfo?.avatar || '',
        content,
        likeCount: 0,
        createTime: this.formatCommentTime(new Date())
      };
      all[idx].comments = all[idx].comments || [];
      all[idx].comments!.unshift(newComment);
      all[idx].commentCount = all[idx].comments!.length;
      this.setStoragePosts(all);
      this.setData({
        currentPost: all[idx],
        commentInput: ''
      });
      wx.showToast({ title: '评论成功', icon: 'success', duration: 1500 });
    }
    this.loadPosts(false);
  },

  // 评论长按事件
  onCommentLongPress(e: WechatMiniprogram.TouchEvent) {
    const post = this.data.currentPost;
    if (!post) return;
    const commentId = String(e.currentTarget.dataset.commentId);
    const uid = this.data.userInfo?.id || '';
    const comments = post.comments || [];
    const current = comments.find(c => c.id === commentId);
    if (!current || current.userId !== uid) {
      return;
    }
    
    // 弹出操作菜单
    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 编辑评论
          this.setData({
            isEditingComment: true,
            editingCommentId: commentId,
            commentInput: current.content
          });
        } else if (res.tapIndex === 1) {
          // 删除评论
          this.deleteComment(e);
        }
      }
    });
  },

  // 格式化时间
  formatTime(time: string): string {
    const date = new Date(time);
    return this.formatCommentTime(date);
  },

  // 格式化评论时间
  formatCommentTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return `${date.getMonth() + 1}-${date.getDate()}`;
  },

  replyComment(e: WechatMiniprogram.TouchEvent) {
    const username = String(e.currentTarget.dataset.username || '');
    this.setData({
      commentInput: `回复 ${username}：`
    });
  },

  likeComment(e: WechatMiniprogram.TouchEvent) {
    const postId = String(e.currentTarget.dataset.postId);
    const commentId = String(e.currentTarget.dataset.commentId);
    const all = this.getStoragePosts();
    const idx = all.findIndex(p => p.id === postId);
    if (idx === -1) return;
    const comments = all[idx].comments || [];
    const cIdx = comments.findIndex(c => c.id === commentId);
    if (cIdx === -1) return;
    comments[cIdx].likeCount += 1;
    all[idx].comments = comments;
    this.setStoragePosts(all);
    this.setData({ currentPost: all[idx] });
  },

  deleteComment(e: WechatMiniprogram.TouchEvent) {
    const post = this.data.currentPost;
    if (!post) return;
    const commentId = String(e.currentTarget.dataset.commentId);
    const uid = this.data.userInfo?.id || '';
    const all = this.getStoragePosts();
    const idx = all.findIndex(p => p.id === post.id);
    if (idx === -1) return;
    const comments = all[idx].comments || [];
    const current = comments.find(c => c.id === commentId);
    if (!current || current.userId !== uid) {
      wx.showToast({ title: '仅可删除自己的评论', icon: 'none' });
      return;
    }
    // 显示确认弹窗
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？删除后无法恢复',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          all[idx].comments = comments.filter(c => c.id !== commentId);
          all[idx].commentCount = all[idx].comments!.length;
          this.setStoragePosts(all);
          this.setData({ currentPost: all[idx] });
          this.loadPosts(false);
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  },

  // 点赞/取消点赞（通过点击爱心图标）
  toggleLike(e: WechatMiniprogram.TouchEvent) {
    const postId = String(e.currentTarget.dataset.postId);
    this.handleLike(postId, true);
  },

  // 处理点赞逻辑（支持双击和点击）
  handleLike(postId: string, shouldAnimate: boolean) {
    const all = this.getStoragePosts();
    const idx = all.findIndex(p => p.id === postId);
    if (idx === -1) return;

    const userLikes = this.data.userLikes || {};
    const isLiked = !!userLikes[postId];

    if (isLiked) {
      // 取消点赞
      all[idx].likeCount = Math.max(0, (all[idx].likeCount || 0) - 1);
      delete userLikes[postId];
    } else {
      // 点赞
      all[idx].likeCount = (all[idx].likeCount || 0) + 1;
      userLikes[postId] = true;
    }

    this.setStoragePosts(all);
    wx.setStorageSync('userLikes', userLikes);

    this.setData({
      userLikes: { ...userLikes },
      likedPostId: shouldAnimate ? postId : '',
      likeAnimating: shouldAnimate
    });

    this.loadPosts(false);

    if (shouldAnimate) {
      setTimeout(() => {
        this.setData({ likedPostId: '', likeAnimating: false });
      }, 800);
    }
  },

  // 双击卡片点赞（小红书风格）
  onCardTouchStart(e: WechatMiniprogram.TouchEvent) {
    const postId = String(e.currentTarget.dataset.postId);
    if (!postId) return;

    const now = Date.now();
    const tapMap = (this as any)._doubleTapMap || {};
    const lastTap = tapMap[postId] || 0;

    // 300ms防抖
    if (now - lastTap < 300) {
      // 双击点赞
      tapMap[postId] = 0;
      (this as any)._doubleTapMap = tapMap;
      this.handleLike(postId, true);
    } else {
      // 记录第一次点击
      tapMap[postId] = now;
      (this as any)._doubleTapMap = tapMap;
    }
  },

  // 加载用户点赞记录
  loadUserLikes() {
    const userLikes = wx.getStorageSync('userLikes') || {};
    this.setData({ userLikes: typeof userLikes === 'object' ? userLikes : {} });
  },

  // 显示帖子操作菜单
  showPostActionSheet(e: WechatMiniprogram.TouchEvent) {
    const postId = String(e.currentTarget.dataset.postId);
    if (!postId) return;
    
    wx.showActionSheet({
      itemList: ['删除'],
      itemColor: '#333',
      success: (res) => {
        if (res.tapIndex === 0) {
          this.deletePost(postId);
        }
      }
    });
  },

  // 删除帖子
  deletePost(postId: string) {
    wx.showModal({
      title: '确认删除',
      content: '确定删除该帖子？删除后无法恢复且关联评论将同步删除',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const all = this.getStoragePosts();
          const filteredPosts = all.filter(p => p.id !== postId);
          this.setStoragePosts(filteredPosts);
          this.loadPosts(true);
          wx.showToast({ title: '帖子已删除', icon: 'success', duration: 1500 });
        }
      }
    });
  },

  noop() {}
});