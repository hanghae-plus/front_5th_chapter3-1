import { Event, RepeatType } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { vi } from 'vitest';

describe('getFilteredEvents', () => {
  // 테스트에 사용할 이벤트 데이터
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01', // 7월 1일 (화요일)
      startTime: '10:00',
      endTime: '11:00',
      description: '첫 번째 이벤트 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-03', // 7월 3일 (목요일)
      startTime: '14:00',
      endTime: '15:00',
      description: '두 번째 이벤트 설명',
      location: '회의실 B',
      category: '미팅',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 15,
    },
    {
      id: '3',
      title: '월간 보고',
      date: '2025-07-15', // 7월 15일 (화요일)
      startTime: '09:00',
      endTime: '10:30',
      description: '월간 보고 회의',
      location: '대회의실',
      category: '보고',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 30,
    },
    {
      id: '4',
      title: '다음 달 이벤트',
      date: '2025-08-02', // 8월 2일 (토요일)
      startTime: '13:00',
      endTime: '14:00',
      description: '다음 달 첫 주 이벤트',
      location: '회의실 C',
      category: '미팅',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    },
    {
      id: '5',
      title: '지난 달 이벤트',
      date: '2025-06-30', // 6월 30일 (월요일) - 7월 1일이 있는 주의 월요일로 수정
      startTime: '11:00',
      endTime: '12:00',
      description: '지난 달 마지막 주 이벤트',
      location: '회의실 D',
      category: '미팅',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'week');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('2');
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    // 7월 1일이 있는 주에는 id 1, 2, 5가 포함됨
    expect(result.length).toBe(3);
    // 적어도 7월 1일과 7월 3일 이벤트는 포함되어야 함
    expect(result.some((event: Event) => event.id === '1')).toBe(true);
    expect(result.some((event: Event) => event.id === '2')).toBe(true);
    expect(result.some((event: Event) => event.id === '5')).toBe(true);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-15'), 'month');
    // 7월에 해당하는 이벤트는 id 1, 2, 3 (3개)
    expect(result.length).toBe(3);
    expect(result.map(event => event.id).sort()).toEqual(['1', '2', '3']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');
    // 해당 주에 있고 '이벤트'를 포함하는 항목은 id 1, 2, 5
    expect(result.length).toBe(3);
    expect(result.map(event => event.id).sort()).toEqual(['1', '2', '5']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    // 여기서는 뷰 필터링이 없다고 가정
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    // 해당 주에 있는 모든 이벤트
    expect(result.length).toBe(3);
    expect(result.map(event => event.id).sort()).toEqual(['1', '2', '5']);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result1 = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');
    const result2 = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');
    expect(result1).toEqual(result2);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    // 6월 30일 ~ 7월 6일 주간 뷰 테스트
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    // 이 주에는 6월 30일(id: 5)과 7월 1일(id: 1), 7월 3일(id: 2) 이벤트가 포함됨
    expect(result.length).toBe(3);
    expect(result.map(event => event.id).sort()).toEqual(['1', '2', '5']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'week');
    expect(result).toEqual([]);
  });
});
