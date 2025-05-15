import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: 'event1',
      title: '이벤트 1',
      description: '이벤트 1 설명',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      location: '서울',
      category: '카테고리 1',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 0,
    },
    {
      id: 'event2',
      title: '이벤트 2',
      description: '이벤트 2 설명',
      date: '2025-07-14',
      startTime: '10:00',
      endTime: '11:00',
      location: '서울',
      category: '카테고리 2',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 0,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const currentDate = new Date('2025-07-14');
    const filteredEvents = getFilteredEvents(events, '이벤트 2', currentDate, 'week');

    expect(filteredEvents).toHaveLength(1);
    expect(filteredEvents[0].id).toBe('event2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const currentDate = new Date('2025-07-01');
    const filteredEvents = getFilteredEvents(events, '이벤트 1', currentDate, 'week');

    expect(filteredEvents).toHaveLength(1);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-07-01');
    const filteredEvents = getFilteredEvents(events, '', currentDate, 'month');

    expect(filteredEvents).toHaveLength(2);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const currentDate = new Date('2025-07-01');
    const filteredEvents = getFilteredEvents(events, '이벤트', currentDate, 'week');

    expect(filteredEvents).toHaveLength(1);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-07-01');
    const filteredEvents = getFilteredEvents(events, '', currentDate, 'month');

    expect(filteredEvents).toHaveLength(2);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const currentDate = new Date('2025-07-01');
    const filteredEvents = getFilteredEvents(events, 'eVent1', currentDate, 'month');

    expect(filteredEvents).toHaveLength(0);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const boundaryEvent: Event = {
      id: 'event3',
      title: '말일 이벤트',
      description: '7월 31일 이벤트',
      date: '2025-07-31',
      startTime: '09:00',
      endTime: '10:00',
      location: '부산',
      category: '카테고리 3',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const currentDate = new Date('2025-07-31');
    const allEvents = [...events, boundaryEvent];
    const filteredEvent = getFilteredEvents(allEvents, '', currentDate, 'month');

    expect(filteredEvent).toHaveLength(3);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const currentDate = new Date('2025-07-01');
    const filteredEvent = getFilteredEvents([], '', currentDate, 'month');

    expect(filteredEvent).toEqual([]);
  });
});
