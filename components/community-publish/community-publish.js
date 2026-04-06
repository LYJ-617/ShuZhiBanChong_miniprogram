Component({
  properties: {
  },
  data: {
    content: '',
    tags: []
  },
  methods: {
    doNothing() {
      // 阻止事件冒泡的空方法
    },
    onContentInput(e) {
      this.setData({
        content: e.detail.value
      });
      this.updatePostData();
    },
    toggleTag(e) {
      const tag = e.currentTarget.dataset.tag;
      console.log('点击标签:', tag);
      const tags = this.data.tags;
      console.log('当前标签列表:', tags);

      if (tags.includes(tag)) {
        console.log('移除标签');
        const newTags = tags.filter(t => t !== tag);
        this.setData({
          tags: newTags
        });
        console.log('移除后的标签列表:', newTags);
      } else {
        console.log('添加标签');
        const newTags = [...tags, tag];
        this.setData({
          tags: newTags
        });
        console.log('添加后的标签列表:', newTags);
      }
      this.updatePostData();
    },
    updatePostData() {
      const postData = {
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
