Component({
  properties: {
    report: {
      type: Object,
      value: null
    }
  },
  data: {
  },
  methods: {
    getRiskLevelText(level) {
      switch (level) {
        case 'low':
          return '低风险';
        case 'medium':
          return '中风险';
        case 'high':
          return '高风险';
        default:
          return '未知';
      }
    }
  }
});
