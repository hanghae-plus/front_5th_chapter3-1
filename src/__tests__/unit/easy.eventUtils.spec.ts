import { Event } from '../../types';
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
        description: '설명 1',
        location: '장소 1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '설명 2',
        location: '장소 2',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const filteredEvents = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'month');

    expect(filteredEvents).toEqual([events[1]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명 1',
        location: '장소 1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-09',
        startTime: '12:00',
        endTime: '13:00',
        description: '설명 2',
        location: '장소 2',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual([events[0]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명 1',
        location: '장소 1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '설명 2',
        location: '장소 2',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(filteredEvents).toEqual(events);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명 1',
        location: '장소 1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '설명 2',
        location: '장소 2',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const filteredEvents = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual(events);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명 1',
        location: '장소 1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '설명 2',
        location: '장소 2',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(filteredEvents).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events: Event[] = [
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: 'EVENT',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: 'event',
        date: '2025-07-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '설명 2',
        location: '장소 2',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const filteredEvents = getFilteredEvents(events, 'event', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual(events);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events: Event[] = [
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '이벤트 2',
        date: '2025-08-01',
        startTime: '12:00',
        endTime: '13:00',
        description: '설명 2',
        location: '장소 2',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(filteredEvents).toEqual([events[0]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [];

    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(filteredEvents).toEqual([]);
  });

  // 추가 테스트 케이스
  it('검색어가 공백일 때도 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명 1',
        location: '장소 1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const filtered = getFilteredEvents(events, '   ', new Date('2025-07-01'), 'month');

    expect(filtered).toEqual(events); // 공백은 검색어 없는 것으로 간주
  });
});
