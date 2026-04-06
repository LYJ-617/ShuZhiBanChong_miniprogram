import { PetLog, AiReport, PetInfo } from './type';

const symptomDiseaseMap: Record<string, string[]> = {
  '粪便稀软': ['肠胃炎', '消化不良', '寄生虫感染'],
  '粪便干结': ['便秘', '脱水'],
  '食欲不佳': ['肠胃炎', '感冒', '口腔疾病', '全身性疾病'],
  '精神不振': ['感冒', '肠胃炎', '疼痛', '全身性疾病'],
  '掉毛严重': ['皮肤病', '营养缺乏', '季节换毛']
};

export const analyzeLogs = (logs: PetLog[], petInfo: PetInfo): AiReport => {
  const symptoms: string[] = [];

  logs.forEach(log => {
    if (log.healthInfo) {
      if (log.healthInfo.stool) {
        if (log.healthInfo.stool.includes('稀') || log.healthInfo.stool.includes('软')) {
          symptoms.push('粪便稀软');
        } else if (log.healthInfo.stool.includes('干') || log.healthInfo.stool.includes('硬')) {
          symptoms.push('粪便干结');
        }
      }
      if (log.healthInfo.appetite) {
        if (log.healthInfo.appetite.includes('差') || log.healthInfo.appetite.includes('不好')) {
          symptoms.push('食欲不佳');
        }
      }
      if (log.healthInfo.spirit) {
        if (log.healthInfo.spirit.includes('差') || log.healthInfo.spirit.includes('萎靡')) {
          symptoms.push('精神不振');
        }
      }
    }
    if (log.content.includes('稀便') || log.content.includes('软便')) symptoms.push('粪便稀软');
    if (log.content.includes('便秘') || log.content.includes('干结')) symptoms.push('粪便干结');
    if (log.content.includes('不吃饭') || log.content.includes('食欲差')) symptoms.push('食欲不佳');
    if (log.content.includes('没精神') || log.content.includes('萎靡')) symptoms.push('精神不振');
    if (log.content.includes('掉毛') || log.content.includes('脱毛')) symptoms.push('掉毛严重');
  });

  const possibleDiseases: string[] = [];
  symptoms.forEach(symptom => {
    if (symptomDiseaseMap[symptom]) {
      symptomDiseaseMap[symptom].forEach(disease => {
        if (!possibleDiseases.includes(disease)) {
          possibleDiseases.push(disease);
        }
      });
    }
  });

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (possibleDiseases.length >= 2) {
    riskLevel = 'medium';
  }
  if (possibleDiseases.length >= 3 || symptoms.includes('精神不振') && symptoms.includes('食欲不佳')) {
    riskLevel = 'high';
  }

  const tips: string[] = [];
  if (riskLevel === 'low') {
    tips.push('当前宠物状态良好，继续保持日常的护理和饮食哦~');
  } else if (riskLevel === 'medium') {
    tips.push('宠物可能存在一些健康问题，请注意观察其状态变化，调整饮食和作息');
    if (possibleDiseases.includes('肠胃炎')) {
      tips.push('建议暂时喂食易消化的食物，避免油腻和生冷食物');
    }
    if (possibleDiseases.includes('消化不良')) {
      tips.push('可以尝试喂食益生菌帮助调理肠胃');
    }
  } else if (riskLevel === 'high') {
    tips.push('宠物的健康状况需要重视，建议尽快带往宠物医院进行检查');
    tips.push('请避免自行用药，务必咨询专业兽医的建议');
  }

  const recommendProducts: string[] = [];
  const recommendDoctors: string[] = [];
  const recommendHospitals: string[] = [];
  if (riskLevel === 'medium' || riskLevel === 'high') {
    if (possibleDiseases.includes('肠胃炎') || possibleDiseases.includes('消化不良')) {
      recommendProducts.push('宠物益生菌', '肠胃调理粮');
    }
    recommendDoctors.push('张兽医（擅长内科疾病）', '李兽医（擅长肠胃疾病）');
    recommendHospitals.push('XX宠物医院（距离2km）', 'YY宠物医院（距离1.5km）');
  }

  return {
    petId: petInfo.id,
    petName: petInfo.petName,
    riskLevel,
    possibleDiseases: possibleDiseases.slice(0, 4),
    tips,
    recommendProducts,
    recommendDoctors,
    recommendHospitals
  };
};