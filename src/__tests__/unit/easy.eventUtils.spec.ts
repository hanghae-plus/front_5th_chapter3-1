import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const currentDate = new Date('2025-07-01');

    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const result = getFilteredEvents(events, '이벤트 2', currentDate, 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const currentDate = new Date('2025-07-01');

    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '밖의 이벤트',
        date: '2025-06-25',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '이벤트 2',
        date: '2025-07-03',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const result = getFilteredEvents(events, '', currentDate, 'week');
    const dates = result.map((e) => e.date);
    expect(dates).toContain('2025-07-01');
    expect(dates).toContain('2025-07-03');
    expect(dates).not.toContain('2025-06-25');
    expect(result.length).toBe(2);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-07-01');

    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 A',
        date: '2025-07-03',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 B',
        date: '2025-07-15',
        startTime: '12:00',
        endTime: '13:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '월말 이벤트',
        date: '2025-07-31',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '4',
        title: '8월 이벤트',
        date: '2025-08-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const result = getFilteredEvents(events, '', currentDate, 'month');
    const dates = result.map((e) => e.date);
    expect(dates).toContain('2025-07-03');
    expect(dates).toContain('2025-07-15');
    expect(dates).toContain('2025-07-31');
    expect(dates).not.toContain('2025-08-01');
    expect(result.length).toBe(3);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const currentDate = new Date('2025-07-01');

    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-10',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const result = getFilteredEvents(events, '이벤트', currentDate, 'week');
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-07-01');

    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 A',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 B',
        date: '2025-07-02',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const result = getFilteredEvents(events, '', currentDate, 'week');
    expect(result.length).toBe(2);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const currentDate = new Date('2025-07-01');

    const events: Event[] = [
      {
        id: '1',
        title: 'event 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: 'event 2',
        date: '2025-07-02',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 설명 포함',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const result = getFilteredEvents(events, 'eVeNt', currentDate, 'month');
    expect(result.length).toBe(2);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const currentDate = new Date('2025-07-01');

    const events: Event[] = [
      {
        id: '1',
        title: '월초 이벤트',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '월말 이벤트',
        date: '2025-07-31',
        startTime: '15:00',
        endTime: '16:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const result = getFilteredEvents(events, '', currentDate, 'month');
    expect(result.map((e) => e.date)).toEqual(['2025-07-01', '2025-07-31']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const currentDate = new Date('2025-07-01');

    const result = getFilteredEvents([], '', currentDate, 'month');
    expect(result).toEqual([]);
  });
});
