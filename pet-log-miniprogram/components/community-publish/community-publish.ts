import { CommunityPost } from '../../utils/type';

Component({
  properties: {
  },
  data: {
    content: '',
    tags: [] as string[]
  },
  methods: {
    onContentInput(e: WechatMiniprogram.InputEvent) {
      this.setData({
        content: e.detail.value
      });
      this.updatePostData();
    },
    toggleTag(e: WechatMiniprogram.TouchEvent) {
      const tag = e.currentTarget.dataset.tag as string;
      const tags = this.data.tags;
      if (tags.includes(tag)) {
        this.setData({
          tags: tags.filter(t => t !== tag)
        });
      } else {
        this.setData({
          tags: [...tags, tag]
        });
      }
      this.updatePostData();
    },
    updatePostData() {
      const postData: CommunityPost = {
        id: '',
        userId: '',
        username: '',
        content: this.data.content,
        tags: this.data.tags,
        createTime: '',
        likeCount: 0,
        commentCount: 0,
        collectCount: 0
      };
      this.triggerEvent('postData', postData);
    }
  }
});