const TABS = ['全部', '精选', '日常记录', '好物分享'];
const PAGE_SIZE = 10;

Page({
  data: {
    statusBarTop: 20,
    safeBottom: 20,
    tabs: TABS,
    selectedTag: '全部',
    tabSliderStyle: 'left: 20px; width: 60px; opacity: 1;',
    searchKeyword: '',
    userInfo: null,
    publishModalVisible: false,
    currentPostData: {},
    allPosts: [],
    renderPosts: [],
    leftPosts: [],
    rightPosts: [],
    page: 1,
    hasMore: true,
    loading: false,
    commentVisible: false,
    currentPost: null,
    commentInput: '',
    likedPostId: '',
    likeAnimating: false,
    // 评论编辑相关
    isEditingComment: false,
    editingCommentId: '',
    originalCommentContent: ''
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    this.loadPosts(true);
  },

  onLoad() {
    const sys = wx.getSystemInfoSync();
    const statusBarTop = (sys.statusBarHeight || 20) * 2;
    const safeBottom = ((sys.screenHeight - ((sys.safeArea && sys.safeArea.bottom) || sys.screenHeight)) || 0) * 2;
    this.setData({ statusBarTop, safeBottom });
    const raw = wx.getStorageSync('userInfo');
    if (raw) this.setData({ userInfo: typeof raw === 'string' ? JSON.parse(raw) : raw });
    
    // 初始化标签滑块位置
    this.initTabSlider();
    
    this.loadPosts(true);
  },
  
  initTabSlider() {
    // 延迟确保 DOM 已渲染
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query.selectAll('.tab-item').boundingClientRect((rects) => {
        if (rects && rects.length > 0) {
          const rect = rects[0];
          this.setData({
            tabSliderStyle: `left: ${rect.left + 20}px; width: ${rect.width - 48}px; opacity: 1;`
          });
        }
      }).exec();
    }, 100);
  },

  onPullDownRefresh() {
    this.loadPosts(true);
    wx.stopPullDownRefresh();
  },
  onReachBottom() {
    this.loadMore();
  },

  getStoragePosts() {
    return wx.getStorageSync('communityPosts') || [];
  },
  setStoragePosts(posts) {
    wx.setStorageSync('communityPosts', posts);
  },
  splitColumns(posts) {
    const left = [];
    const right = [];
    let lh = 0;
    let rh = 0;
    posts.forEach((p, idx) => {
      const h = 240 + Math.min(80, (p.content || '').length * 2) + (idx % 3) * 18;
      if (lh <= rh) {
        left.push({ ...p, imageHeight: h });
        lh += h;
      } else {
        right.push({ ...p, imageHeight: h });
        rh += h;
      }
    });
    return { left, right };
  },
  loadPosts(reset = false) {
    if (this.data.loading) return;
    this.setData({ loading: true });
    const all = this.getStoragePosts().filter(post => {
      const publishTo = post.publishTo;
      if (!publishTo) return true;
      return Array.isArray(publishTo) && publishTo.includes('community');
    });
    const filtered = all.filter(post => {
      const tagOK = this.data.selectedTag === '全部' || (post.tags || []).includes(this.data.selectedTag);
      const kw = this.data.searchKeyword.trim();
      const keywordOK = !kw || (post.content || '').includes(kw) || (post.username || '').includes(kw);
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
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value || '', page: 1 });
    this.loadPosts(true);
  },
  selectTag(e) {
    const tag = e.currentTarget.dataset.tag || '全部';
    this.setData({ selectedTag: tag, page: 1 });
    
    // 计算滑块位置
    const tabs = this.data.tabs;
    const index = tabs.indexOf(tag);
    const query = wx.createSelectorQuery();
    query.selectAll('.tab-item').boundingClientRect((rects) => {
      if (rects && rects[index]) {
        const rect = rects[index];
        const left = rect.left + (index > 0 ? 20 : 0); // 加上左侧padding
        const width = rect.width;
        this.setData({
          tabSliderStyle: `left: ${left}px; width: ${width - 20}px; opacity: 1;`
        });
      }
    }).exec();
    
    this.loadPosts(true);
  },
  loadMore() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ page: this.data.page + 1 });
    this.loadPosts(false);
  },
  showPublishModal() {
    this.setData({ publishModalVisible: true });
  },
  hidePublishModal() {
    this.setData({ publishModalVisible: false, currentPostData: {} });
    // 重置发布组件表单
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const publishComponent = currentPage.selectComponent('.publish-scroll');
    if (publishComponent && publishComponent.resetForm) {
      publishComponent.resetForm();
    }
  },
  onPostDataChange(e) {
    this.setData({ currentPostData: e.detail || {} });
  },
  submitPost() {
    const draft = this.data.currentPostData || {};
    if (!draft.content || !draft.content.trim()) {
      wx.showToast({ title: '请输入帖子内容', icon: 'none' });
      return;
    }
    if (!Array.isArray(draft.tags) || draft.tags.length === 0) {
      wx.showToast({ title: '请至少选择1个话题标签', icon: 'none' });
      return;
    }
    const post = {
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
  onPostTap(e) {
    const postId = String(e.currentTarget.dataset.postId);
    const now = Date.now();
    const map = this._tapMap || {};
    const last = map[postId] || 0;
    map[postId] = now;
    this._tapMap = map;
    if (now - last < 300) {
      this.likePostById(postId, true);
      return;
    }
    setTimeout(() => {
      const current = (this._tapMap || {})[postId];
      if (current === now) this.openComments(postId);
    }, 320);
  },
  likePostById(postId, animate = false) {
    const all = this.getStoragePosts();
    const idx = all.findIndex(p => p.id === postId);
    if (idx === -1) return;
    all[idx].likeCount += 1;
    this.setStoragePosts(all);
    this.setData({ likedPostId: postId, likeAnimating: animate });
    this.loadPosts(false);
    if (animate) setTimeout(() => this.setData({ likedPostId: '', likeAnimating: false }), 800);
  },
  previewImage(e) {
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
  
  // 图片加载错误处理
  onImageError(e) {
    const { postId, errorIndex } = e.currentTarget.dataset;
    console.error('Image load error:', { postId, errorIndex, err: e.detail });
    
    // 可以在这里添加重试逻辑或显示占位图
    // 例如：更新对应帖子的图片状态
    const allPosts = this.data.allPosts.map(post => {
      if (post.id === postId && post.images) {
        // 标记图片加载失败
        const newImages = [...post.images];
        if (newImages[errorIndex]) {
          newImages[errorIndex] = '/static/images/image-error.png'; // 使用占位图
        }
        return { ...post, images: newImages };
      }
      return post;
    });
    
    this.setData({ allPosts });
    this.splitColumnsAndSet(allPosts);
  },
  
  // 辅助方法：分割列并设置数据
  splitColumnsAndSet(posts) {
    const { left, right } = this.splitColumns(posts);
    this.setData({
      leftPosts: left,
      rightPosts: right
    });
  },
  
  openComments(postId) {
    const post = this.getStoragePosts().find(p => p.id === postId) || null;
    if (!post) return;
    this.setData({ 
      currentPost: post, 
      commentVisible: true, 
      commentInput: '',
      isEditingComment: false,
      editingCommentId: ''
    });
  },
  closeComments() {
    this.setData({ 
      commentVisible: false, 
      currentPost: null, 
      commentInput: '',
      isEditingComment: false,
      editingCommentId: '',
      originalCommentContent: ''
    });
  },
  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value || '' });
  },
  // 长按评论弹出操作菜单
  onCommentLongPress(e) {
    const commentId = e.currentTarget.dataset.commentId;
    const uid = this.data.userInfo?.id || '';
    const comments = this.data.currentPost?.comments || [];
    const comment = comments.find(c => c.id === commentId);
    
    // 仅本人评论支持编辑
    if (comment && comment.userId === uid) {
      wx.showActionSheet({
        itemList: ['编辑', '删除'],
        itemColor: '#f5222d',
        success: (res) => {
          if (res.tapIndex === 0) {
            // 编辑
            this.startEditComment(comment);
          } else if (res.tapIndex === 1) {
            // 删除
            this.confirmDeleteComment(commentId);
          }
        }
      });
    }
  },
  // 开始编辑评论
  startEditComment(comment) {
    this.setData({
      isEditingComment: true,
      editingCommentId: comment.id,
      originalCommentContent: comment.content,
      commentInput: comment.content
    });
  },
  // 确认删除评论
  confirmDeleteComment(commentId) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      confirmColor: '#f5222d',
      success: (res) => {
        if (res.confirm) {
          this.deleteCommentById(commentId);
        }
      }
    });
  },
  // 根据ID删除评论
  deleteCommentById(commentId) {
    const post = this.data.currentPost;
    if (!post) return;
    const all = this.getStoragePosts();
    const idx = all.findIndex(p => p.id === post.id);
    if (idx === -1) return;
    
    all[idx].comments = (all[idx].comments || []).filter(c => c.id !== commentId);
    all[idx].commentCount = all[idx].comments.length;
    this.setStoragePosts(all);
    this.setData({ currentPost: all[idx] });
    this.loadPosts(false);
    wx.showToast({ title: '已删除', icon: 'success' });
  },
  submitComment() {
    const post = this.data.currentPost;
    const content = this.data.commentInput.trim();
    if (!post || !content) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }
    
    const all = this.getStoragePosts();
    const idx = all.findIndex(p => p.id === post.id);
    if (idx === -1) return;
    
    // 编辑模式
    if (this.data.isEditingComment) {
      const comments = all[idx].comments || [];
      const cIdx = comments.findIndex(c => c.id === this.data.editingCommentId);
      if (cIdx !== -1) {
        comments[cIdx].content = content;
        comments[cIdx].updateTime = new Date().toISOString();
        all[idx].comments = comments;
        this.setStoragePosts(all);
        this.setData({ 
          currentPost: all[idx], 
          commentInput: '',
          isEditingComment: false,
          editingCommentId: ''
        });
        wx.showToast({ title: '评论已修改', icon: 'success' });
      }
    } else {
      // 新增评论
      const newComment = {
        id: `c_${Date.now()}`,
        userId: this.data.userInfo?.id || 'guest',
        username: this.data.userInfo?.username || '匿名用户',
        userAvatar: this.data.userInfo?.avatarUrl || this.data.userInfo?.avatar || '',
        content,
        likeCount: 0,
        createTime: new Date().toISOString()
      };
      all[idx].comments = all[idx].comments || [];
      all[idx].comments.unshift(newComment);
      all[idx].commentCount = all[idx].comments.length;
      this.setStoragePosts(all);
      this.setData({ currentPost: all[idx], commentInput: '' });
      wx.showToast({ title: '评论成功', icon: 'success' });
    }
    this.loadPosts(false);
  },
  replyComment(e) {
    const username = String(e.currentTarget.dataset.username || '');
    this.setData({ commentInput: `回复 ${username}：` });
  },
  likeComment(e) {
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
  deleteComment(e) {
    const post = this.data.currentPost;
    if (!post) return;
    const commentId = String(e.currentTarget.dataset.commentId);
    this.confirmDeleteComment(commentId);
  },
  noop() {},
  // 格式化时间显示
  formatTime(isoTime) {
    if (!isoTime) return '';
    const date = new Date(isoTime);
    const now = new Date();
    const diff = now - date;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    
    if (diff < minute) return '刚刚';
    if (diff < hour) return Math.floor(diff / minute) + '分钟前';
    if (diff < day) return Math.floor(diff / hour) + '小时前';
    if (diff < 7 * day) return Math.floor(diff / day) + '天前';
    
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
});
