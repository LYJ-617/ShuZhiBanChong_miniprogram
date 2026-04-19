import { CommunityComment, CommunityPost, UserInfo } from '../../utils/type';

// 评论项包含原帖子信息
interface CommentWithPost {
  comment: CommunityComment;
  post: CommunityPost | null;
}

Page({
  data: {
    // 系统适配
    statusBarTop: 20,
    safeBottom: 20,
    // 用户信息
    userInfo: null as UserInfo | null,
    // 评论列表
    comments: [] as CommentWithPost[],
    // 空状态
    isEmpty: true
  },

  onLoad() {
    this.initSystemInfo();
    this.loadUserInfo();
    this.loadMyComments();
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

  // 加载我的评论
  loadMyComments() {
    const userInfo = this.data.userInfo;
    if (!userInfo) return;

    try {
      // 获取用户评论记录
      const storageComments = wx.getStorageSync('userComments') || [];
      const allComments = typeof storageComments === 'string' ? JSON.parse(storageComments) : storageComments;

      // 筛选当前用户的评论
      const myComments = allComments.filter((c: CommunityComment) => 
        c.userId === userInfo.id
      );

      // 获取社区帖子（用于显示原帖子信息）
      const storagePosts = wx.getStorageSync('communityPosts') || [];
      const allPosts = typeof storagePosts === 'string' ? JSON.parse(storagePosts) : storagePosts;

      // 组合评论和对应帖子
      const commentsWithPosts = myComments.map((comment: CommunityComment) => {
        const post = allPosts.find((p: CommunityPost) => p.id === comment.postId) || null;
        return { comment, post };
      });

      // 按评论时间倒序
      const sorted = commentsWithPosts.sort((a: CommentWithPost, b: CommentWithPost) => 
        new Date(b.comment.createTime).getTime() - new Date(a.comment.createTime).getTime()
      );

      this.setData({
        comments: sorted,
        isEmpty: sorted.length === 0
      });
    } catch (e) {
      console.error('加载评论失败', e);
    }
  },

  // 格式化日期
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  // 跳转到原帖子
  goToPost(e: WechatMiniprogram.TouchEvent) {
    const postId = e.currentTarget.dataset.postId;
    // 这里可以跳转到帖子详情页，暂时使用社区首页
    wx.switchTab({
      url: '/pages/community/community'
    });
  },

  // 删除评论
  deleteComment(e: WechatMiniprogram.TouchEvent) {
    const commentId = e.currentTarget.dataset.commentId;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？删除后无法恢复',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.doDeleteComment(commentId);
        }
      }
    });
  },

  doDeleteComment(commentId: string) {
    try {
      // 删除用户评论记录
      const storageComments = wx.getStorageSync('userComments') || [];
      const allComments = typeof storageComments === 'string' ? JSON.parse(storageComments) : storageComments;
      const filtered = allComments.filter((c: CommunityComment) => c.id !== commentId);
      wx.setStorageSync('userComments', filtered);

      // 更新原帖子的评论数
      const comment = allComments.find((c: CommunityComment) => c.id === commentId);
      if (comment) {
        const storagePosts = wx.getStorageSync('communityPosts') || [];
        const allPosts = typeof storagePosts === 'string' ? JSON.parse(storagePosts) : storagePosts;
        const idx = allPosts.findIndex((p: CommunityPost) => p.id === comment.postId);
        if (idx !== -1) {
          allPosts[idx].commentCount = Math.max(0, (allPosts[idx].commentCount || 1) - 1);
          wx.setStorageSync('communityPosts', allPosts);
        }
      }

      this.loadMyComments();
      wx.showToast({ title: '删除成功', icon: 'success' });
    } catch (e) {
      console.error('删除评论失败', e);
    }
  },

  noop() {}
});