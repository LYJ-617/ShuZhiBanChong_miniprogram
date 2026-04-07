// custom-tab-bar/index.ts
Component({
  data: {
    selected: 0,
    // 导航图标配置
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        icon: "/static/images/home.png",
        selectedIcon: "/static/images/home-active.png"
      },
      {
        pagePath: "/pages/community/community",
        text: "社区",
        icon: "/static/images/community.png",
        selectedIcon: "/static/images/community-active.png"
      },
      {
        pagePath: "/pages/log/log",
        text: "记录",
        icon: "/static/images/log.png",
        selectedIcon: "/static/images/log-active.png"
      },
      {
        pagePath: "/pages/service/service",
        text: "服务",
        icon: "/static/images/service.png",
        selectedIcon: "/static/images/service-active.png"
      },
      {
        pagePath: "/pages/mine/mine",
        text: "我的",
        icon: "/static/images/mine.png",
        selectedIcon: "/static/images/mine-active.png"
      }
    ]
  },

  methods: {
    // tab切换逻辑
    switchTab(e: WechatMiniprogram.TouchEvent) {
      const path = e.currentTarget.dataset.path;
      const index = e.currentTarget.dataset.index;
      
      wx.switchTab({ url: path });
      this.setData({ selected: index });
    }
  },

  attached() {
    // 页面加载时更新选中状态
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const path = '/' + currentPage.route;
    
    const index = this.data.list.findIndex(item => item.pagePath === path);
    if (index !== -1) {
      this.setData({ selected: index });
    }
  }
});