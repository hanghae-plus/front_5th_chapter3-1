import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-05-28',
      startTime: '10:00',
      endTime: '11:00',
      description: 'event1',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-05-28',
      startTime: '14:00',
      endTime: '15:00',
      description: 'event2',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-06-30',
      startTime: '14:00',
      endTime: '15:00',
      description: 'event3',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    },
    {
      id: '4',
      title: '이벤트 4',
      date: '2025-07-02',
      startTime: '14:00',
      endTime: '15:00',
      description: 'event4',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    },
    {
      id: '5',
      title: '이벤트 5',
      date: '2025-07-21',
      startTime: '14:00',
      endTime: '15:00',
      description: 'event5',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    },
    {
      id: '6',
      title: '이벤트 6',
      date: '2025-08-01',
      startTime: '14:00',
      endTime: '15:00',
      description: 'event6',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 1,
    },
  ]
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-05-28'), 'month')
    expect(result[0].title).toBe('이벤트 2')
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week')
    expect(result).toHaveLength(2)
    expect(result.map((event) => event.title)).toEqual(['이벤트 3', '이벤트 4'])
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month')
    expect(result).toHaveLength(2)
    expect(result.map((event) => event.title)).toEqual(['이벤트 4', '이벤트 5'])
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const searchResult = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week')
    expect(searchResult).toHaveLength(2)
    expect(searchResult.map((event) => event.title)).toEqual(['이벤트 3', '이벤트 4'])
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-05-01'), 'month')
    expect(result).toHaveLength(2)
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, 'EVENT', new Date('2025-05-01'), 'month')
    expect(result).toHaveLength(2)
    expect(result.map((event) => event.description)).toEqual(['event1', 'event2'])
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month')
    expect(result).toHaveLength(2)
    expect(result.map((event) => event.title)).toEqual(['이벤트 4', '이벤트 5'])
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'month')
    expect(result).toHaveLength(0)
  });
});
