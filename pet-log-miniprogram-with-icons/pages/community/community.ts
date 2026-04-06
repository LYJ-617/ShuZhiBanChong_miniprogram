import { getCommunityPosts, addCommunityPost } from '../../utils/api';
import { CommunityPost, UserInfo } from '../../utils/type';

Page({
  data: {
    postList: [] as CommunityPost[],
    selectedTag: '',
    publishModalVisible: false,
    currentPostData: {} as CommunityPost,
    userInfo: null as UserInfo | null
  },

  async onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: JSON.parse(userInfo)
      });
    }
    this.loadPosts();
  },

  async loadPosts() {
    const posts = await getCommunityPosts(this.data.selectedTag);
    this.setData({
      postList: posts
    });
  },

  selectTag(e: WechatMiniprogram.TouchEvent) {
    const tag = e.currentTarget.dataset.tag as string;
    this.setData({
      selectedTag: tag
    });
    this.loadPosts();
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
      currentPostData: {} as CommunityPost
    });
  },

  onPostDataChange(e: WechatMiniprogram.CustomEvent) {
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
    const post: CommunityPost = {
      ...this.data.currentPostData,
      userId: this.data.userInfo?.id || '',
      username: this.data.userInfo?.username || '',
      likeCount: 0,
      commentCount: 0,
      collectCount: 0
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
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      });
    }
  },

  likePost(e: WechatMiniprogram.TouchEvent) {
    const postId = e.currentTarget.dataset.postId as string;
    const postList = this.data.postList;
    const postIndex = postList.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      postList[postIndex].likeCount += 1;
      this.setData({
        postList
      });
    }
  },

  commentPost(e: WechatMiniprogram.TouchEvent) {
    const postId = e.currentTarget.dataset.postId as string;
    wx.showToast({
      title: '评论功能待开发',
      icon: 'none'
    });
  },

  collectPost(e: WechatMiniprogram.TouchEvent) {
    const postId = e.currentTarget.dataset.postId as string;
    const postList = this.data.postList;
    const postIndex = postList.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      postList[postIndex].collectCount += 1;
      this.setData({
        postList
      });
    }
  },

  goToPostDetail(e: WechatMiniprogram.TouchEvent) {
    const postId = e.currentTarget.dataset.postId as string;
    wx.showToast({
      title: '帖子详情待开发',
      icon: 'none'
    });
  },

  formatTime(timeStr: string): string {
    const date = new Date(timeStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
});