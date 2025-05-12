import { Event } from '../../types';

const defaultEvent: Event = {
  id: '1',
  title: '기본 이벤트',
  date: '2025-07-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '기본 이벤트 설명',
  location: '서울시 강남구',
  category: '회의',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 30,
};

export const sampleEvents: Event[] = [
  {
    id: '1',
    title: '이벤트1',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '2',
    title: '이벤트2',
    date: '2025-07-02',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '3',
    title: '이벤트3',
    date: '2025-07-01',
    startTime: '11:00',
    endTime: '12:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
];

export function createEvent(overrides: Partial<Event> = {}): Event {
  return {
    ...defaultEvent,
    id: `event-${Math.random().toString(36).substring(2, 9)}`,
    ...overrides,
  };
}
