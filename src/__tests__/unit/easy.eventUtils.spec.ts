import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events: Event[] = [
      {
        id: 'test-1b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:30',
        description: '이벤트 1 설명',
        location: '항해 젭 12팀 회의실',
        category: '테스트코드',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
      {
        id: 'test-2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:30',
        description: '이벤트 2 설명2',
        location: '항해 젭 12팀 회의실2',
        category: '테스트코드2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ];

    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'month');

    expect(result).toEqual([events[1]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const events: Event[] = [
      {
        id: 'test-1b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:30',
        description: '이벤트 1 설명',
        location: '항해 젭 12팀 회의실',
        category: '테스트코드',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
      {
        id: 'test-2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '이벤트 2',
        date: '2025-07-08',
        startTime: '10:00',
        endTime: '11:30',
        description: '이벤트 2 설명2',
        location: '항해 젭 12팀 회의실2',
        category: '테스트코드2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(result).toEqual([events[0]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: 'test-1b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:30',
        description: '이벤트 1 설명',
        location: '항해 젭 12팀 회의실',
        category: '테스트코드',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
      {
        id: 'test-2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '이벤트 2',
        date: '2025-07-08',
        startTime: '10:00',
        endTime: '11:30',
        description: '이벤트 2 설명2',
        location: '항해 젭 12팀 회의실2',
        category: '테스트코드2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(result).toEqual(events);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events: Event[] = [
      {
        id: 'test-1b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:30',
        description: '이벤트 1 설명',
        location: '항해 젭 12팀 회의실',
        category: '테스트코드',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
      {
        id: 'test-2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '이벤트 2',
        date: '2025-07-08',
        startTime: '10:00',
        endTime: '11:30',
        description: '이벤트 2 설명2',
        location: '항해 젭 12팀 회의실2',
        category: '테스트코드2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ];

    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');

    expect(result).toEqual([events[0]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: 'test-1b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:30',
        description: '이벤트 1 설명',
        location: '항해 젭 12팀 회의실',
        category: '테스트코드',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
      {
        id: 'test-2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '이벤트 2',
        date: '2025-07-08',
        startTime: '10:00',
        endTime: '11:30',
        description: '이벤트 2 설명2',
        location: '항해 젭 12팀 회의실2',
        category: '테스트코드2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(result).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events: Event[] = [
      {
        id: 'test-1b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: 'EVENT 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:30',
        description: '이벤트 1 설명',
        location: '항해 젭 12팀 회의실',
        category: '테스트코드',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
      {
        id: 'test-2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: 'EVENT 2',
        date: '2025-07-02',
        startTime: '10:00',
        endTime: '11:30',
        description: '이벤트 2 설명2',
        location: '항해 젭 12팀 회의실2',
        category: '테스트코드2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ];

    const result = getFilteredEvents(events, 'event', new Date('2025-07-01'), 'week');

    expect(result).toEqual(events);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events: Event[] = [
      {
        id: 'test-1b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: 'EVENT 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:30',
        description: '이벤트 1 설명',
        location: '항해 젭 12팀 회의실',
        category: '테스트코드',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
      {
        id: 'test-2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: 'EVENT 2',
        date: '2025-06-30',
        startTime: '10:00',
        endTime: '11:30',
        description: '이벤트 2 설명2',
        location: '항해 젭 12팀 회의실2',
        category: '테스트코드2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ];

    const result = getFilteredEvents(events, 'event', new Date('2025-07-01'), 'month');

    expect(result).toEqual([events[0]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [];

    const result = getFilteredEvents(events, 'event', new Date('2025-07-01'), 'month');

    expect(result).toEqual([]);
  });
});
