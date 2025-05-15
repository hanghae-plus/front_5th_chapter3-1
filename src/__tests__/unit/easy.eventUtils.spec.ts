import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: 'event 1',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: 'event 설명 1',
      location: '장소 1',
      category: '카테고리 1',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-02',
      startTime: '16:00',
      endTime: '17:00',
      description: '이벤트 설명 2',
      location: '장소 2',
      category: '카테고리 2',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-07-03',
      startTime: '18:00',
      endTime: '19:00',
      description: '이벤트 설명 3',
      location: '장소 3',
      category: '카테고리 3',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '4',
      title: '이벤트 4',
      date: '2025-07-25',
      startTime: '20:00',
      endTime: '21:00',
      description: '이벤트 설명 4',
      location: '장소 4',
      category: '카테고리 4',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '5',
      title: '이벤트 5',
      date: '2025-08-01',
      startTime: '22:00',
      endTime: '23:00',
      description: '이벤트 설명 5',
      location: '장소 5',
      category: '카테고리 5',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '6',
      title: '이벤트 6',
      date: '2025-08-02',
      startTime: '23:00',
      endTime: '11:00',
      description: '이벤트 설명 6',
      location: '장소 6',
      category: '카테고리 6',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '7',
      title: '이벤트 7',
      date: '2025-08-31',
      startTime: '00:00',
      endTime: '01:00',
      description: '이벤트 설명 7',
      location: '장소 7',
      category: '카테고리 7',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const filteredEvents = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual([events[1]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual([events[0], events[1], events[2]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(filteredEvents).toEqual([events[0], events[1], events[2], events[3]]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const filteredEvents = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual([events[1], events[2]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(filteredEvents).toEqual([events[0], events[1], events[2], events[3]]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filteredEvents = getFilteredEvents(events, 'EVENT 1', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual([events[0]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-08-01'), 'month');

    expect(filteredEvents).toEqual([events[4], events[5], events[6]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const emptyEvents: Event[] = [];
    const filteredEvents = getFilteredEvents(emptyEvents, '이벤트', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual([]);
  });
});
