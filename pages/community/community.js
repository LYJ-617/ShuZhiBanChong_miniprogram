import { getCommunityPosts, addCommunityPost } from '../../utils/api.js';

Page({
  data: {
    postList: [],
    leftPosts: [],
    rightPosts: [],
    selectedTag: '',
    searchKeyword: '',
    publishModalVisible: false,
    currentPostData: {},
    userInfo: null,
    likedPosts: [],
    collectedPosts: [],
    showDetailModal: false,
    currentDetailPost: null,
    detailCommentText: '',
    loading: false,
    // 添加防抖锁
    isProcessingLike: {},
    isProcessingCollect: {}
  },

  async onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    console.log('加载用户信息:', userInfo);
    if (userInfo) {
      this.setData({
        userInfo: typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo
      });
    }
    // 初始化模拟数据
    this.initMockData();
    // 加载用户的点赞和收藏状态
    this.loadUserActions();
    this.loadPosts();
  },

  onShow() {
    // 每次页面显示时重新加载用户操作状态和帖子数据，确保数据同步
    this.loadUserActions();
    this.loadPosts();
  },

  // 初始化模拟数据
  initMockData() {
    let mockPosts = wx.getStorageSync('communityPosts');
    if (!mockPosts || mockPosts.length === 0) {
      mockPosts = [
        {
          id: '1',
          userId: 'user1',
          username: '小宠日记',
          avatar: 'https://via.placeholder.com/100',
          title: '我家猫咪今天学会了新技能！',
          content: '今天终于教会了猫咪握手，太开心了！分享一下训练的小技巧，大家有什么好的训练方法吗？',
          tags: ['日常记录'],
          images: ['https://via.placeholder.com/400x500/ff6b6b/ffffff?text=猫咪训练'],
          likeCount: 128,
          commentCount: 32,
          collectCount: 56,
          createTime: new Date(Date.now() - 3600000).toISOString(),
          views: 256
        },
        {
          id: '2',
          userId: 'user2',
          username: '宠物医生小王',
          avatar: 'https://via.placeholder.com/100',
          title: '春季宠物护理必备知识',
          content: '春天到了，宠物容易出现的健康问题和注意事项，这篇文章帮你全面了解！',
          tags: ['医疗知识'],
          images: ['https://via.placeholder.com/400x600/4ecdc4/ffffff?text=宠物护理'],
          likeCount: 256,
          commentCount: 45,
          collectCount: 89,
          createTime: new Date(Date.now() - 7200000).toISOString(),
          views: 512
        },
        {
          id: '3',
          userId: 'user3',
          username: '好物推荐官',
          avatar: 'https://via.placeholder.com/100',
          title: '这款宠物零食真的超赞！',
          content: '给毛孩子买了这款零食，超爱吃，而且配料表很干净，推荐给大家！',
          tags: ['好物分享'],
          images: ['https://via.placeholder.com/400x450/ffe66d/ffffff?text=宠物零食'],
          likeCount: 89,
          commentCount: 23,
          collectCount: 34,
          createTime: new Date(Date.now() - 10800000).toISOString(),
          views: 178
        },
        {
          id: '4',
          userId: 'user4',
          username: '科普达人',
          avatar: 'https://via.placeholder.com/100',
          title: '狗狗为什么爱摇尾巴？',
          content: '狗狗摇尾巴不仅是开心的表现，还有很多其他的含义，一起来了解吧！',
          tags: ['科普知识'],
          images: ['https://via.placeholder.com/400x550/a8e6cf/ffffff?text=狗狗尾巴'],
          likeCount: 312,
          commentCount: 67,
          collectCount: 123,
          createTime: new Date(Date.now() - 14400000).toISOString(),
          views: 624
        },
        {
          id: '5',
          userId: 'user5',
          username: '萌宠日常',
          avatar: 'https://via.placeholder.com/100',
          title: '周末带毛孩子去公园啦',
          content: '阳光明媚的周末，带着家里的狗狗去公园玩，好开心！',
          tags: ['日常记录'],
          images: ['https://via.placeholder.com/400x480/ffd93d/ffffff?text=公园游玩', 'https://via.placeholder.com/400x480/ffd93d/ffffff?text=玩耍瞬间'],
          likeCount: 198,
          commentCount: 41,
          collectCount: 72,
          createTime: new Date(Date.now() - 18000000).toISOString(),
          views: 396
        },
        {
          id: '6',
          userId: 'user6',
          username: '医疗小助手',
          avatar: 'https://via.placeholder.com/100',
          title: '宠物打疫苗的时间表',
          content: '为宠物定期接种疫苗是保护它们健康的重要措施，这里整理了完整的接种时间表。',
          tags: ['医疗知识'],
          images: ['https://via.placeholder.com/400x520/6c5ce7/ffffff?text=疫苗时间表'],
          likeCount: 245,
          commentCount: 38,
          collectCount: 98,
          createTime: new Date(Date.now() - 21600000).toISOString(),
          views: 490
        }
      ];
      wx.setStorageSync('communityPosts', mockPosts);
    }
  },

  loadUserActions() {
    const likedPosts = (wx.getStorageSync('likedPosts') || []).map(id => String(id));
    const collectedPosts = (wx.getStorageSync('collectedPosts') || []).map(id => String(id));
    console.log('加载点赞状态:', likedPosts);
    console.log('加载收藏状态:', collectedPosts);
    this.setData({
      likedPosts,
      collectedPosts
    });
  },

  async loadPosts() {
    this.setData({
      loading: true
    });

    let posts = await getCommunityPosts(this.data.selectedTag);
    console.log('从API获取的帖子:', posts);

    // 搜索过滤
    if (this.data.searchKeyword) {
      posts = posts.filter(post => {
        const keyword = this.data.searchKeyword.toLowerCase();
        return (post.title && post.title.toLowerCase().includes(keyword)) ||
               (post.content && post.content.toLowerCase().includes(keyword)) ||
               (post.tags && post.tags.some(tag => tag.toLowerCase().includes(keyword)));
      });
    }

    // 按时间倒序排列
    posts.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    // 确保所有帖子的id都是字符串类型
    const normalizedPosts = posts.map(post => ({
      ...post,
      id: String(post.id),
      likeCount: post.likeCount || 0,
      commentCount: post.commentCount || 0,
      collectCount: post.collectCount || 0
    }));

    // 从存储中重新加载所有帖子，确保数据一致性
    const allPosts = wx.getStorageSync('communityPosts') || [];
    const mergedPosts = normalizedPosts.map(post => {
      const storedPost = allPosts.find(p => String(p.id) === post.id);
      return storedPost ? { ...storedPost, id: String(storedPost.id) } : post;
    });

    // 为每个帖子添加点赞和收藏状态
    const likedPosts = (this.data.likedPosts || []).map(id => String(id));
    const collectedPosts = (this.data.collectedPosts || []).map(id => String(id));

    const postsWithStatus = mergedPosts.map(post => ({
      ...post,
      isLiked: likedPosts.includes(String(post.id)),
      isCollected: collectedPosts.includes(String(post.id))
    }));

    // 分配到左右两列
    const leftPosts = [];
    const rightPosts = [];
    postsWithStatus.forEach((post, index) => {
      if (index % 2 === 0) {
        leftPosts.push(post);
      } else {
        rightPosts.push(post);
      }
    });

    console.log('合并后的帖子数据:', postsWithStatus);

    this.setData({
      postList: postsWithStatus,
      leftPosts,
      rightPosts,
      loading: false
    });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    // 防抖处理
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.loadPosts();
    }, 500);
  },

  // 显示通知
  showNotifications() {
    wx.showToast({
      title: '暂无新通知',
      icon: 'none'
    });
  },

  // 选择标签
  selectTag(e) {
    const tag = e.currentTarget.dataset.tag;
    this.setData({
      selectedTag: tag
    });
    this.loadPosts();
  },

  // 加载更多
  loadMore() {
    console.log('加载更多');
    // 这里可以实现分页加载逻辑
  },

  showPublishModal() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    this.setData({
      publishModalVisible: true
    });
  },

  hidePublishModal() {
    this.setData({
      publishModalVisible: false,
      currentPostData: {}
    });
  },

  onPostDataChange(e) {
    this.setData({
      currentPostData: e.detail
    });
  },

  async submitPost() {
    if (!this.data.currentPostData.content || this.data.currentPostData.tags.length === 0) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    const post = {
      ...this.data.currentPostData,
      userId: this.data.userInfo?.id || 'user_' + Date.now(),
      username: this.data.userInfo?.username || '匿名用户',
      avatar: this.data.userInfo?.avatar || 'https://via.placeholder.com/100',
      title: this.data.currentPostData.content.substring(0, 30),
      likeCount: 0,
      commentCount: 0,
      collectCount: 0,
      views: 0,
      createTime: new Date().toISOString(),
      images: this.data.currentPostData.images || []
    };

    try {
      await addCommunityPost(post);
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      });
      this.hidePublishModal();
      this.loadPosts();
    } catch (err) {
      console.error('发布失败:', err);
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      });
    }
  },

  likePost(e) {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const postId = String(e.currentTarget.dataset.postId);
    console.log('点赞帖子ID:', postId);

    // 检查是否正在处理中（防抖）
    if (this.data.isProcessingLike[postId]) {
      console.log('正在处理中，忽略重复点击');
      return;
    }

    // 设置处理锁
    const newProcessingState = {
      ...this.data.isProcessingLike,
      [postId]: true
    };
    this.setData({
      isProcessingLike: newProcessingState
    });

    try {
      // 从存储中重新获取最新的点赞状态，防止并发问题
      const currentLikedPosts = (wx.getStorageSync('likedPosts') || []).map(id => String(id));
      console.log('从存储读取的最新点赞列表:', currentLikedPosts);

      const postList = [...this.data.postList];
      const postIndex = postList.findIndex(p => String(p.id) === postId);
      console.log('帖子索引:', postIndex);

      if (postIndex === -1) {
        console.log('未找到帖子');
        return;
      }

      const isLiked = currentLikedPosts.includes(postId);
      console.log('是否已点赞:', isLiked);

      if (isLiked) {
        // 取消点赞
        postList[postIndex].likeCount = Math.max(0, postList[postIndex].likeCount - 1);
        postList[postIndex].isLiked = false;
        const newLikedPosts = currentLikedPosts.filter(id => id !== postId);
        console.log('取消点赞，新的点赞列表:', newLikedPosts);

        this.setData({
          postList,
          likedPosts: newLikedPosts
        });
        wx.setStorageSync('likedPosts', newLikedPosts);
      } else {
        // 添加点赞
        postList[postIndex].likeCount += 1;
        postList[postIndex].isLiked = true;
        const newLikedPosts = [...currentLikedPosts, postId];
        console.log('添加点赞，新的点赞列表:', newLikedPosts);

        this.setData({
          postList,
          likedPosts: newLikedPosts
        });
        wx.setStorageSync('likedPosts', newLikedPosts);
      }

      // 同步到帖子存储
      const allPosts = wx.getStorageSync('communityPosts') || [];
      const allPostIndex = allPosts.findIndex(p => String(p.id) === postId);
      if (allPostIndex !== -1) {
        allPosts[allPostIndex] = {...postList[postIndex]};
        wx.setStorageSync('communityPosts', allPosts);
        console.log('同步帖子到存储成功，帖子ID:', postId, '点赞数:', postList[postIndex].likeCount);
      } else {
        console.log('未在存储中找到帖子，帖子ID:', postId);
      }

      // 更新左右列表
      this.distributePosts(postList);

      // 如果详情页打开，也更新详情数据
      if (this.data.showDetailModal && this.data.currentDetailPost && String(this.data.currentDetailPost.id) === postId) {
        const updatedDetailPost = {
          ...postList[postIndex],
          isLiked: postList[postIndex].isLiked,
          isCollected: postList[postIndex].isCollected
        };
        this.setData({
          currentDetailPost: updatedDetailPost
        });
      }
    } finally {
      // 释放处理锁
      const releaseState = {
        ...this.data.isProcessingLike,
        [postId]: false
      };
      this.setData({
        isProcessingLike: releaseState
      });
    }
  },

  // 详情页评论输入
  onDetailCommentInput(e) {
    this.setData({
      detailCommentText: e.detail.value
    });
  },

  // 提交详情页评论
  async submitDetailComment() {
    const postId = this.data.currentDetailPost?.id;
    if (!postId) return;

    if (!this.data.detailCommentText.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      });
      return;
    }

    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 添加评论到帖子的评论列表
    const newComment = {
      id: Date.now().toString(),
      userId: this.data.userInfo.id || 'user_' + Date.now(),
      username: this.data.userInfo.username || '匿名用户',
      avatar: this.data.userInfo.avatar || 'https://via.placeholder.com/100',
      content: this.data.detailCommentText.trim(),
      createTime: new Date().toISOString(),
      likeCount: 0,
      likedBy: []
    };

    const postList = [...this.data.postList];
    const postIndex = postList.findIndex(p => String(p.id) === postId);

    if (postIndex !== -1) {
      if (!postList[postIndex].comments) {
        postList[postIndex].comments = [];
      }
      postList[postIndex].comments.push(newComment);
      postList[postIndex].commentCount += 1;

      this.setData({
        postList,
        currentDetailPost: {...postList[postIndex]},
        detailCommentText: ''
      });

      // 更新左右列表
      this.distributePosts(postList);

      // 保存到存储
      const allPosts = wx.getStorageSync('communityPosts') || [];
      const allPostIndex = allPosts.findIndex(p => String(p.id) === postId);
      if (allPostIndex !== -1) {
        allPosts[allPostIndex] = {...postList[postIndex]};
        wx.setStorageSync('communityPosts', allPosts);
      }

      wx.showToast({
        title: '评论成功',
        icon: 'success'
      });
    }
  },

  // 分配帖子到左右列表
  distributePosts(postList) {
    const leftPosts = [];
    const rightPosts = [];
    postList.forEach((post, index) => {
      if (index % 2 === 0) {
        leftPosts.push(post);
      } else {
        rightPosts.push(post);
      }
    });
    this.setData({
      leftPosts,
      rightPosts
    });
  },

  // 分享帖子
  sharePost() {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  likeComment(e) {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const { postId, commentId } = e.currentTarget.dataset;
    console.log('点赞评论，帖子ID:', postId, '评论ID:', commentId);
    const postList = [...this.data.postList];
    const postIndex = postList.findIndex(p => p.id === postId);

    if (postIndex !== -1 && postList[postIndex].comments) {
      const commentIndex = postList[postIndex].comments.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        const comment = {...postList[postIndex].comments[commentIndex]};
        const userId = this.data.userInfo.id;

        if (!comment.likedBy) {
          comment.likedBy = [];
        }

        if (comment.likedBy.includes(userId)) {
          comment.likeCount = Math.max(0, comment.likeCount - 1);
          comment.likedBy = comment.likedBy.filter(id => id !== userId);
          console.log('取消点赞评论');
        } else {
          comment.likeCount += 1;
          comment.likedBy.push(userId);
          console.log('点赞评论');
        }

        postList[postIndex].comments[commentIndex] = comment;
        this.setData({
          postList
        });

        // 如果当前正在查看详情弹窗，也更新详情数据
        if (this.data.showDetailModal && this.data.currentDetailPost && this.data.currentDetailPost.id === postId) {
          this.setData({
            currentDetailPost: {...postList[postIndex]}
          });
        }

        // 保存到存储
        const allPosts = wx.getStorageSync('communityPosts') || [];
        const allPostIndex = allPosts.findIndex(p => p.id === postId);
        if (allPostIndex !== -1) {
          allPosts[allPostIndex] = {...postList[postIndex]};
          wx.setStorageSync('communityPosts', allPosts);
        }
      }
    }
  },

  collectPost(e) {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const postId = String(e.currentTarget.dataset.postId);
    console.log('收藏帖子ID:', postId);

    // 检查是否正在处理中（防抖）
    if (this.data.isProcessingCollect[postId]) {
      console.log('正在处理中，忽略重复点击');
      return;
    }

    // 设置处理锁
    const newProcessingState = {
      ...this.data.isProcessingCollect,
      [postId]: true
    };
    this.setData({
      isProcessingCollect: newProcessingState
    });

    try {
      // 从存储中重新获取最新的收藏状态，防止并发问题
      const currentCollectedPosts = (wx.getStorageSync('collectedPosts') || []).map(id => String(id));
      console.log('从存储读取的最新收藏列表:', currentCollectedPosts);

      const postList = [...this.data.postList];
      const postIndex = postList.findIndex(p => String(p.id) === postId);
      console.log('帖子索引:', postIndex);

      if (postIndex === -1) {
        console.log('未找到帖子');
        return;
      }

      const isCollected = currentCollectedPosts.includes(postId);
      console.log('是否已收藏:', isCollected);

      if (isCollected) {
        // 取消收藏
        postList[postIndex].collectCount = Math.max(0, postList[postIndex].collectCount - 1);
        postList[postIndex].isCollected = false;
        const newCollectedPosts = currentCollectedPosts.filter(id => id !== postId);
        console.log('取消收藏，新的收藏列表:', newCollectedPosts);

        this.setData({
          postList,
          collectedPosts: newCollectedPosts
        });
        wx.setStorageSync('collectedPosts', newCollectedPosts);
      } else {
        // 添加收藏
        postList[postIndex].collectCount += 1;
        postList[postIndex].isCollected = true;
        const newCollectedPosts = [...currentCollectedPosts, postId];
        console.log('添加收藏，新的收藏列表:', newCollectedPosts);

        this.setData({
          postList,
          collectedPosts: newCollectedPosts
        });
        wx.setStorageSync('collectedPosts', newCollectedPosts);
      }

      // 同步到帖子存储
      const allPosts = wx.getStorageSync('communityPosts') || [];
      const allPostIndex = allPosts.findIndex(p => String(p.id) === postId);
      if (allPostIndex !== -1) {
        allPosts[allPostIndex] = {...postList[postIndex]};
        wx.setStorageSync('communityPosts', allPosts);
        console.log('同步帖子到存储成功，帖子ID:', postId, '收藏数:', postList[postIndex].collectCount);
      } else {
        console.log('未在存储中找到帖子，帖子ID:', postId);
      }

      // 更新左右列表
      this.distributePosts(postList);

      // 如果详情页打开，也更新详情数据
      if (this.data.showDetailModal && this.data.currentDetailPost && String(this.data.currentDetailPost.id) === postId) {
        const updatedDetailPost = {
          ...postList[postIndex],
          isLiked: postList[postIndex].isLiked,
          isCollected: postList[postIndex].isCollected
        };
        this.setData({
          currentDetailPost: updatedDetailPost
        });
      }
    } finally {
      // 释放处理锁
      const releaseState = {
        ...this.data.isProcessingCollect,
        [postId]: false
      };
      this.setData({
        isProcessingCollect: releaseState
      });
    }
  },

  goToPostDetail(e) {
    const postId = String(e.currentTarget.dataset.postId);
    console.log('查看帖子详情，帖子ID:', postId);
    const post = this.data.postList.find(p => String(p.id) === postId);
    if (post) {
      console.log('帖子数据:', post);
      if (!post.comments) {
        post.comments = [];
      }
      // 确保详情帖子的点赞和收藏状态正确
      const likedPosts = (this.data.likedPosts || []).map(id => String(id));
      const collectedPosts = (this.data.collectedPosts || []).map(id => String(id));
      const detailPost = {
        ...post,
        isLiked: likedPosts.includes(String(post.id)),
        isCollected: collectedPosts.includes(String(post.id))
      };

      this.setData({
        showDetailModal: true,
        currentDetailPost: detailPost
      });
    }
  },

  hideDetailModal() {
    this.setData({
      showDetailModal: false,
      currentDetailPost: null
    });
  },

  formatTime(timeStr) {
    const date = new Date(timeStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  },

  deletePost(e) {
    console.log('删除帖子被调用');

    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const postId = e.currentTarget.dataset.postId;
    console.log('要删除的帖子ID:', postId);

    const postList = [...this.data.postList];
    const postIndex = postList.findIndex(p => String(p.id) === postId);

    if (postIndex === -1) {
      console.log('帖子未找到');
      return;
    }

    const post = postList[postIndex];
    console.log('帖子作者ID:', post.userId, '当前用户ID:', this.data.userInfo.id);

    if (String(post.userId) !== String(this.data.userInfo.id)) {
      console.log('权限检查失败：不是帖子作者');
      wx.showToast({
        title: '只能删除自己的帖子',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条帖子吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('用户确认删除');
          const newPostList = postList.filter(p => String(p.id) !== postId);
          this.setData({
            postList: newPostList
          });

          // 更新左右列表
          this.distributePosts(newPostList);

          const allPosts = wx.getStorageSync('communityPosts') || [];
          const newAllPosts = allPosts.filter(p => String(p.id) !== postId);
          wx.setStorageSync('communityPosts', newAllPosts);

          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });

          if (this.data.showDetailModal && String(this.data.currentDetailPost.id) === postId) {
            console.log('关闭详情弹窗');
            this.hideDetailModal();
          }
        }
      }
    });
  }
});
