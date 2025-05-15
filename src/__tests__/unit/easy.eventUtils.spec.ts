import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const baseEvents: Event[] = [
    {
      id: '1',
      title: 'Event 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: 'Event 2',
      date: '2025-07-02',
      startTime: '11:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
    {
      id: '3',
      title: 'Event 3',
      date: '2025-08-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(baseEvents, 'Event 2', new Date('2025-07-01'), 'month');
    expect(result.map((e) => e.id)).toEqual(['2']);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(baseEvents, '', new Date('2025-07-01'), 'week');
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(baseEvents, '', new Date('2025-07-01'), 'month');
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(baseEvents, 'Event', new Date('2025-07-01'), 'week');
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(baseEvents, '', new Date('2025-07-01'), 'month');
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(baseEvents, 'EvEnT 2', new Date('2025-07-01'), 'month');
    expect(result.map((e) => e.id)).toEqual(['2']);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events = [
      ...baseEvents,
      {
        ...baseEvents[2],
        date: '2025-07-31',
        id: '4',
        title: 'Event 4',
      },
    ];
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result.map((e) => e.id)).toEqual(['1', '2', '4']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'month');
    expect(result).toEqual([]);
  });
});
