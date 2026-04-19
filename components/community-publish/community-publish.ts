import { CommunityPost } from '../../utils/type';

Component({
  properties: {
  },
  data: {
    content: '',
    tags: [] as string[],
    images: [] as string[],
    isDragging: false,
    dragIndex: -1,
    dropIndex: -1
  },
  methods: {
    onContentInput(e: WechatMiniprogram.InputEvent) {
      this.setData({
        content: e.detail.value
      });
      this.updatePostData();
    },
    toggleTag(e: WechatMiniprogram.TouchEvent) {
      console.log('toggleTag called:', e);
      const tag = e.currentTarget.dataset.tag as string;
      console.log('Tag:', tag);
      if (!tag) return;
      
      const tags = this.data.tags;
      console.log('Current tags:', tags);
      let newTags: string[];
      
      if (tags.includes(tag)) {
        newTags = tags.filter(t => t !== tag);
      } else {
        newTags = [...tags, tag];
      }
      
      console.log('New tags:', newTags);
      
      this.setData({ tags: newTags }, () => {
        console.log('Tags updated successfully');
        console.log('Updated tags:', this.data.tags);
        this.updatePostData();
      });
    },
    // 选择图片
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
          // 压缩图片
          this.compressImages(newImages).then(compressedImages => {
            this.setData({
              images: [...this.data.images, ...compressedImages]
            });
            this.updatePostData();
          });
        }
      });
    },
    // 压缩图片
    compressImages(images: string[]): Promise<string[]> {
      return new Promise((resolve) => {
        const compressed: string[] = [];
        let processed = 0;
        
        if (images.length === 0) {
          resolve([]);
          return;
        }
        
        images.forEach(image => {
          wx.compressImage({
            src: image,
            quality: 80,
            success: (res) => {
              compressed.push(res.tempFilePath);
              processed++;
              if (processed === images.length) {
                resolve(compressed);
              }
            },
            fail: () => {
              compressed.push(image);
              processed++;
              if (processed === images.length) {
                resolve(compressed);
              }
            }
          });
        });
      });
    },
    // 预览图片
    previewImage(e: WechatMiniprogram.TouchEvent) {
      const index = e.currentTarget.dataset.index as number;
      wx.previewImage({
        current: this.data.images[index],
        urls: this.data.images
      });
    },
    // 编辑图片
    editImage(e: WechatMiniprogram.TouchEvent) {
      const index = e.currentTarget.dataset.index as number;
      wx.editImage({
        src: this.data.images[index],
        success: (res) => {
          const images = [...this.data.images];
          images[index] = res.tempFilePath;
          this.setData({
            images
          });
          this.updatePostData();
        }
      });
    },
    // 删除图片
    deleteImage(e: WechatMiniprogram.TouchEvent) {
      const index = e.currentTarget.dataset.index as number;
      const images = this.data.images.filter((_, i) => i !== index);
      this.setData({
        images
      });
      this.updatePostData();
    },
    // 开始拖拽
    onLongPress(e: WechatMiniprogram.TouchEvent) {
      this.setData({
        isDragging: true,
        dragIndex: e.currentTarget.dataset.index as number,
        dropIndex: -1
      });
    },
    // 拖拽移动
    onTouchMove(e: WechatMiniprogram.TouchEvent) {
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
    // 结束拖拽
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
    updatePostData() {
      const postData: any = {
        id: '',
        userId: '',
        username: '',
        content: this.data.content,
        tags: this.data.tags,
        images: this.data.images,
        createTime: '',
        likeCount: 0,
        commentCount: 0,
        collectCount: 0
      };
      this.triggerEvent('postData', postData);
    }
  }
});