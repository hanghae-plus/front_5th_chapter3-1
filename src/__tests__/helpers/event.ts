import { Event } from '../../types';

export const createTestEvent = (overrideData: Partial<Event>): Event => {
  return {
    id: '1',
    title: '테스트 이벤트',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '설명',
    location: '장소',
    category: '카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
    ...overrideData,
  };
};
