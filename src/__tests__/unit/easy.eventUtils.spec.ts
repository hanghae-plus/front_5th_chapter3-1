import { getFilteredEvents } from '@/entities/event/lib/eventUtils';
import { Event } from '@/entities/event/model/types';

const events: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-06-30',
    startTime: '17:00',
    endTime: '18:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2025-07-01',
    startTime: '11:00',
    endTime: '12:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '3',
    title: '이벤트 3',
    date: '2025-07-11',
    startTime: '17:00',
    endTime: '18:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '4',
    title: '이벤트 4',
    date: '2025-07-12',
    startTime: '17:00',
    endTime: '18:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '5',
    title: '이벤트 5',
    date: '2025-07-13',
    startTime: '17:00',
    endTime: '18:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '6',
    title: 'Event 6',
    date: '2025-07-14',
    startTime: '17:00',
    endTime: '18:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    // TODO: 일단 다른 조건을 만족해야 검색어도 찾을 수 있는거 아니가 아니면 searchEvents 함수 테스트인가?
    const searchTerm = '이벤트 2';
    const result = getFilteredEvents(events, searchTerm, new Date('2025-07-01'), 'week');
    expect(result).toEqual([
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(result).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-06-30',
        startTime: '17:00',
        endTime: '18:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result).toEqual([
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-11',
        startTime: '17:00',
        endTime: '18:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '이벤트 4',
        date: '2025-07-12',
        startTime: '17:00',
        endTime: '18:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '5',
        title: '이벤트 5',
        date: '2025-07-13',
        startTime: '17:00',
        endTime: '18:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '6',
        title: 'Event 6',
        date: '2025-07-14',
        startTime: '17:00',
        endTime: '18:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-12'), 'week');
    expect(result).toEqual([
      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-11',
        startTime: '17:00',
        endTime: '18:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '이벤트 4',
        date: '2025-07-12',
        startTime: '17:00',
        endTime: '18:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);
  });

  it('검색어가 없을 때 다른 조건을 만족하는 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-12'), 'week');
    expect(result).toEqual([
      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-11',
        startTime: '17:00',
        endTime: '18:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '이벤트 4',
        date: '2025-07-12',
        startTime: '17:00',
        endTime: '18:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, 'event', new Date('2025-07-12'), 'month');
    expect(result).toEqual([
      {
        id: '6',
        title: 'Event 6',
        date: '2025-07-14',
        startTime: '17:00',
        endTime: '18:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-06-30'), 'month');
    expect(result).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-06-30',
        startTime: '17:00',
        endTime: '18:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '이벤트', new Date('2025-07-12'), 'week');
    expect(result).toEqual([]);
  });
});
