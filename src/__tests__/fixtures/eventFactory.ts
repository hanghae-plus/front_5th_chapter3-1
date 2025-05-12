import { Event, RepeatType } from '../../types';

const baseEvent: Event = {
  id: '0',
  title: '기본 이벤트',
  date: '2025-07-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '',
  location: '',
  category: '',
  repeat: { type: 'none' as RepeatType, interval: 0 },
  notificationTime: 0,
};

export function createEvent(overrides: Partial<Event> = {}): Event {
  return {
    ...baseEvent,
    id: `event-${Math.random().toString(36).substring(2, 9)}`,
    ...overrides,
  };
}

export function createEventsForDates(
  startDate: string,
  count: number,
  template: Partial<Event> = {}
): Event[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(startDate);

    date.setDate(date.getDate() + i);
    const formattedDate = date.toISOString().split('T')[0];

    return createEvent({
      ...template,
      id: `date-${i + 1}`,
      date: formattedDate,
    });
  });
}

export const filterTestEvents: Event[] = [
  createEvent({
    id: '1',
    title: '이벤트 1',
    description: '첫 번째 미팅',
    location: '회의실 A',
    date: '2025-07-01',
  }),
  createEvent({
    id: '2',
    title: '이벤트 2',
    description: '두 번째 미팅',
    location: '회의실 B',
    date: '2025-07-03',
  }),
  createEvent({
    id: '3',
    title: '중요 회의',
    description: '이벤트 2 관련 회의',
    location: '대회의실',
    date: '2025-07-10',
  }),
  createEvent({
    id: '4',
    title: '월말 결산',
    description: '7월 결산',
    location: '재무부',
    date: '2025-07-31',
  }),
  createEvent({
    id: '5',
    title: '월초 계획',
    description: '8월 계획',
    location: '기획실',
    date: '2025-08-01',
  }),
  createEvent({
    id: '6',
    title: '연초 계획',
    description: '2025년 계획',
    location: '회의실 C',
    date: '2025-01-05',
  }),
];

export const overlapTestEvents: Event[] = [
  createEvent({
    id: 'overlap-1',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '11:00',
    title: '겹침 테스트 1',
  }),
  createEvent({
    id: 'overlap-2',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '12:00',
    title: '겹침 테스트 2',
  }),
  createEvent({
    id: 'overlap-3',
    date: '2025-07-01',
    startTime: '12:00',
    endTime: '13:00',
    title: '겹침 없음 1',
  }),
];

export const testDatasets = {
  filter: filterTestEvents,
  overlap: overlapTestEvents,
};

export function getTestEvents(type: keyof typeof testDatasets | 'all' = 'all'): Event[] {
  if (type === 'all') {
    return [...filterTestEvents, ...overlapTestEvents];
  }

  return testDatasets[type];
}
