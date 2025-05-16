import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '첫 번째 이벤트',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-02',
      startTime: '14:00',
      endTime: '15:00',
      description: '두 번째 이벤트',
      location: '회의실 B',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '다른 이벤트',
      date: '2025-07-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '세 번째 이벤트',
      location: '회의실 C',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'week');
    expect(result).toHaveLength(2); // 7월 1일과 2일의 이벤트
    expect(result.map((event) => event.id)).toEqual(['1', '2']);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(3);
    expect(result.map((event) => event.id)).toEqual(['1', '2', '3']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트', new Date('2025-07-01'), 'week');
    expect(result).toHaveLength(2);
    expect(result.map((event) => event.id)).toEqual(['1', '2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(mockEvents, '회의실', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(3);
    expect(result.every((event) => event.location.toLowerCase().includes('회의실'))).toBe(true);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const eventsWithBoundary: Event[] = [
      ...mockEvents,
      {
        id: '4',
        title: '월말 이벤트',
        date: '2025-07-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '월말 이벤트',
        location: '회의실 D',
        category: '회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const result = getFilteredEvents(eventsWithBoundary, '', new Date('2025-07-31'), 'month');
    expect(result).toHaveLength(4);
    expect(result[3].id).toBe('4');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '이벤트', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(0);
  });
});
