import { Event } from '../../entities/event';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
        category: '이벤트 2 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
    ];

    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'week');

    expect(result).toEqual([events[1]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-06-28',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-06-29',
        startTime: '11:00',
        endTime: '12:00',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
        category: '이벤트 2 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-05',
        startTime: '12:00',
        endTime: '13:00',
        description: '이벤트 3 설명',
        location: '이벤트 3 장소',
        category: '이벤트 3 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '이벤트 4',
        date: '2025-07-06',
        startTime: '13:00',
        endTime: '14:00',
        description: '이벤트 4 설명',
        location: '이벤트 4 장소',
        category: '이벤트 4 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
    ];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(result).toEqual([events[1], events[2]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-06-30',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
        category: '이벤트 2 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-30',
        startTime: '08:00',
        endTime: '09:00',
        description: '이벤트 3 설명',
        location: '이벤트 3 장소',
        category: '이벤트 3 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '이벤트 4',
        date: '2025-08-01',
        startTime: '13:00',
        endTime: '14:00',
        description: '이벤트 4 설명',
        location: '이벤트 4 장소',
        category: '이벤트 4 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
    ];

    const result = getFilteredEvents(events, '', new Date('2025-07-15'), 'month');

    expect(result).toEqual([events[1], events[2]]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-06-28',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-06-29',
        startTime: '11:00',
        endTime: '12:00',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
        category: '이벤트 2 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-05',
        startTime: '12:00',
        endTime: '13:00',
        description: '이벤트 3 설명',
        location: '이벤트 3 장소',
        category: '이벤트 3 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '4',
        date: '2025-07-06',
        startTime: '13:00',
        endTime: '14:00',
        description: '4 설명',
        location: '4 장소',
        category: '이벤트 4 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
    ];

    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');

    expect(result).toEqual([events[1], events[2]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-06-29',
        startTime: '11:00',
        endTime: '12:00',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
        category: '이벤트 2 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '3',
        date: '2025-07-05',
        startTime: '12:00',
        endTime: '13:00',
        description: '3 설명',
        location: '3 장소',
        category: '3 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
    ];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(result).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-06-29',
        startTime: '10:00',
        endTime: '11:00',
        description: 'event 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-06-29',
        startTime: '11:00',
        endTime: '12:00',
        description: 'Event 2 설명',
        location: '이벤트 2 장소',
        category: '이벤트 2 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
    ];

    const result = getFilteredEvents(events, 'event', new Date('2025-07-01'), 'week');

    expect(result).toEqual(events);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-06-30',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
        category: '이벤트 1 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
        category: '이벤트 2 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-31',
        startTime: '08:00',
        endTime: '09:00',
        description: '이벤트 3 설명',
        location: '이벤트 3 장소',
        category: '이벤트 3 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '이벤트 4',
        date: '2025-08-01',
        startTime: '13:00',
        endTime: '14:00',
        description: '이벤트 4 설명',
        location: '이벤트 4 장소',
        category: '이벤트 4 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
    ];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(result).toEqual([events[1], events[2]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(result).toEqual([]);
  });
});
