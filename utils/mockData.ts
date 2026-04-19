export const mockUserInfo = {
  id: 'u_mock_001',
  username: '数智宠主',
  phone: '13800000000',
  avatar: '',
  createTime: new Date().toISOString()
};

export const mockPetList = [
  { id: 'p1', petName: '布丁', type: '猫', breed: '英短', gender: 'male', birthday: '2024-01-01' },
  { id: 'p2', petName: '可可', type: '狗', breed: '柯基', gender: 'female', birthday: '2023-06-01' }
];

export const mockScheduleList = [
  { id: 's1', petId: 'p1', title: '疫苗提醒', time: '2026-04-09 10:00', isDone: false },
  { id: 's2', petId: 'p2', title: '体内驱虫', time: '2026-04-10 20:00', isDone: false }
];
