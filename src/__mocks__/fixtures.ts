import { Event } from '../types';

export const getTestEvents: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-05-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트 1 설명',
    location: '이벤트 1 장소',
    category: '이벤트 1 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2025-05-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트 2 설명',
    location: '이벤트 2 장소',
    category: '이벤트 2 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];

export const overlapTestEvents: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-05-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트 1 설명',
    location: '이벤트 1 장소',
    category: '이벤트 1 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2025-05-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트 2 설명',
    location: '이벤트 2 장소',
    category: '이벤트 2 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];
