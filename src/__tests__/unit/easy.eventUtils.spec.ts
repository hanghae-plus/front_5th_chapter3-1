import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '첫 번째 이벤트',
      location: '서울',
      category: '일정',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-04',
      startTime: '14:00',
      endTime: '15:00',
      description: '두 번째 이벤트',
      location: '부산',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-06-30',
      startTime: '16:00',
      endTime: '17:00',
      description: '세 번째 이벤트',
      location: '창원',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '4',
      title: 'Event 4',
      date: '2025-08-15',
      startTime: '16:00',
      endTime: '17:00',
      description: '네 번째 이벤트',
      location: '창원',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '5',
      title: 'event 5',
      date: '2025-08-30',
      startTime: '16:00',
      endTime: '17:00',
      description: '다섯 번째 이벤트',
      location: '창원',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '6',
      title: 'event 6',
      date: '2025-09-30',
      startTime: '16:00',
      endTime: '17:00',
      description: '월말 이벤트',
      location: '창원',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events = getFilteredEvents(mockEvents, '이벤트 2', new Date('2025-07-01'), 'week');
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const events = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'week');
    const dates = events.map((event) => event.date);
    expect(dates).toContain('2025-06-30');
    expect(dates).toContain('2025-07-01');
    expect(dates).toContain('2025-07-04');
    expect(events).toHaveLength(3);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const events = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
    expect(events).toHaveLength(2);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events = getFilteredEvents(mockEvents, '이벤트', new Date('2025-07-01'), 'week');
    const titles = events.map((event) => event.title);
    expect(titles).toContain('이벤트 1');
    expect(titles).toContain('이벤트 2');
    expect(titles).toContain('이벤트 3');
    expect(titles).toHaveLength(3);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
    expect(events).toHaveLength(2);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events = getFilteredEvents(mockEvents, 'event', new Date('2025-08-01'), 'month');
    expect(events).toHaveLength(2);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events = getFilteredEvents(mockEvents, '', new Date('2025-09-01'), 'month');
    expect(events.some((event) => event.date === '2025-09-30')).toBe(true);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events = getFilteredEvents([], '', new Date('2025-07-01'), 'month');
    expect(events).toEqual([]);
  });
});
