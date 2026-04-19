Component({
  properties: {
  },
  data: {
    content: '',
    selectedTags: [],
    images: [],
    isDragging: false,
    dragIndex: -1,
    dropIndex: -1
  },
  methods: {
    onContentInput(e) {
      this.setData({
        content: e.detail.value
      });
      this.updatePostData();
    },
    
    toggleTag(e) {
      const tag = e.currentTarget.dataset.tag;
      if (!tag) return;
      
      let selectedTags = [...this.data.selectedTags];
      const index = selectedTags.indexOf(tag);
      
      if (index > -1) {
        selectedTags.splice(index, 1);
      } else {
        selectedTags.push(tag);
      }
      
      this.setData({
        selectedTags
      });
      
      this.updatePostData();
    },
    
    chooseImage() {
      const remaining = 9 - this.data.images.length;
      if (remaining <= 0) {
        wx.showToast({ title: '最多只能上传9张图片', icon: 'none' });
        return;
      }
      
      wx.chooseImage({
        count: remaining,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const newImages = res.tempFilePaths;
          this.setData({
            images: [...this.data.images, ...newImages]
          });
          this.updatePostData();
        }
      });
    },
    previewImage(e) {
      const index = e.currentTarget.dataset.index;
      wx.previewImage({
        current: this.data.images[index],
        urls: this.data.images
      });
    },
    deleteImage(e) {
      const index = e.currentTarget.dataset.index;
      const images = this.data.images.filter((_, i) => i !== index);
      this.setData({
        images
      });
      this.updatePostData();
    },
    onLongPress(e) {
      this.setData({
        isDragging: true,
        dragIndex: e.currentTarget.dataset.index,
        dropIndex: -1
      });
    },
    onTouchMove(e) {
      if (!this.data.isDragging) return;
      
      const touchY = e.touches[0].clientY;
      const imageItems = wx.createSelectorQuery().selectAll('.image-item');
      
      imageItems.boundingClientRect((rects) => {
        if (!rects || rects.length === 0) return;
        
        let dropIndex = -1;
        for (let i = 0; i < rects.length; i++) {
          const rect = rects[i];
          if (touchY >= rect.top && touchY <= rect.bottom) {
            dropIndex = i;
            break;
          }
        }
        
        if (dropIndex !== -1 && dropIndex !== this.data.dragIndex) {
          this.setData({
            dropIndex
          });
        }
      }).exec();
    },
    onTouchEnd() {
      if (!this.data.isDragging) return;
      
      const { dragIndex, dropIndex } = this.data;
      if (dropIndex !== -1 && dropIndex !== dragIndex) {
        const images = [...this.data.images];
        const [draggedImage] = images.splice(dragIndex, 1);
        images.splice(dropIndex, 0, draggedImage);
        
        this.setData({
          images,
          isDragging: false,
          dragIndex: -1,
          dropIndex: -1
        });
        this.updatePostData();
      } else {
        this.setData({
          isDragging: false,
          dragIndex: -1,
          dropIndex: -1
        });
      }
    },
    doNothing() {
    },
    updatePostData() {
      const postData = {
        id: '',
        userId: '',
        username: '',
        content: this.data.content,
        tags: this.data.selectedTags,
        images: this.data.images,
        createTime: '',
        likeCount: 0,
        commentCount: 0,
        collectCount: 0
      };
      this.triggerEvent('postData', postData);
    },
    resetTags() {
      this.setData({
        selectedTags: []
      });
    },
    resetForm() {
      this.setData({
        content: '',
        selectedTags: [],
        images: [],
        isDragging: false,
        dragIndex: -1,
        dropIndex: -1
      });
    }
  }
});
