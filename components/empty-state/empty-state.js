Component({
  properties: {
    text: {
      type: String,
      value: '暂无内容哦～'
    },
    btnText: {
      type: String,
      value: ''
    }
  },
  methods: {
    onActionTap() {
      this.triggerEvent('action');
    }
  }
});
