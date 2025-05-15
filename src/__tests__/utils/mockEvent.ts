import { type Event } from '../../types';

let idCounter = 1;

export const createMockEvent = (override: Partial<Event> = {}): Event => {
  return {
    id: `${idCounter++}`,
    title: '기본 제목',
    date: '2025-01-01',
    startTime: '09:00',
    endTime: '10:00',
    location: '회의실 A',
    description: '설명',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
    ...override,
  };
};

export const mockEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    description: '팀 회의',
    location: '회의실 A',
    date: '2025-10-01',
    startTime: '10:00',
    endTime: '11:00',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 식사',
    description: '동료들과 점심',
    location: '식당',
    date: '2025-10-01',
    startTime: '12:00',
    endTime: '13:00',
    category: '식사',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 5,
  },
  {
    id: '3',
    title: '개인 일정',
    description: '병원 방문',
    location: '서울 병원',
    date: '2025-11-01',
    startTime: '09:00',
    endTime: '10:00',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  },
];
