import { AiReport } from '../../utils/type';

Component({
  properties: {
    report: {
      type: Object as PropType<AiReport>,
      value: null
    }
  },
  data: {
  },
  methods: {
    getRiskLevelText(level: 'low' | 'medium' | 'high'): string {
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