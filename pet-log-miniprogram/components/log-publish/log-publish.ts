import { getPetList } from '../../utils/api';
import { PetInfo, PetLog } from '../../utils/type';

Component({
  properties: {
  },
  data: {
    petList: [] as PetInfo[],
    selectedPetId: '',
    content: '',
    tags: [] as string[],
    publishTo: [] as string[],
    healthInfo: {
      stool: '',
      appetite: '',
      spirit: ''
    }
  },
  lifetimes: {
    async attached() {
      const petList = await getPetList();
      this.setData({
        petList
      });
      if (petList.length > 0) {
        this.setData({
          selectedPetId: petList[0].id
        });
      }
      this.updateLogData();
    }
  },
  methods: {
    selectPet(e: WechatMiniprogram.TouchEvent) {
      const petId = e.currentTarget.dataset.petId as string;
      this.setData({
        selectedPetId: petId
      });
      this.updateLogData();
    },
    onContentInput(e: WechatMiniprogram.InputEvent) {
      this.setData({
        content: e.detail.value
      });
      this.updateLogData();
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
      this.updateLogData();
    },
    togglePublishTo(e: WechatMiniprogram.TouchEvent) {
      const to = e.currentTarget.dataset.to as string;
      const publishTo = this.data.publishTo;
      if (publishTo.includes(to)) {
        this.setData({
          publishTo: publishTo.filter(t => t !== to)
        });
      } else {
        this.setData({
          publishTo: [...publishTo, to]
        });
      }
      this.updateLogData();
    },
    selectHealthInfo(e: WechatMiniprogram.TouchEvent) {
      const key = e.currentTarget.dataset.key as keyof typeof this.data.healthInfo;
      const value = e.currentTarget.dataset.value as string;
      const healthInfo = this.data.healthInfo;
      healthInfo[key] = value;
      this.setData({
        healthInfo
      });
      this.updateLogData();
    },
    updateLogData() {
      const logData: PetLog = {
        id: '',
        userId: wx.getStorageSync('userInfo') ? JSON.parse(wx.getStorageSync('userInfo')).id : '',
        petId: this.data.selectedPetId,
        content: this.data.content,
        tags: this.data.tags,
        publishTo: this.data.publishTo,
        createTime: '',
        healthInfo: this.data.tags.includes('健康') ? this.data.healthInfo : undefined
      };
      this.triggerEvent('logData', logData);
    }
  }
});