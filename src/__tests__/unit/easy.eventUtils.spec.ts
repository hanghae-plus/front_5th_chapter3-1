import { describe, it, expect } from 'vitest';

import type { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

// 테스트용 이벤트 데이터
const events: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '첫 번째 이벤트',
    location: '서울',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2025-07-02',
    startTime: '12:00',
    endTime: '13:00',
    description: '두 번째 이벤트',
    location: '부산',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '이벤트 3',
    date: '2025-07-10',
    startTime: '14:00',
    endTime: '15:00',
    description: '세 번째 이벤트',
    location: '대구',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '이벤트 4',
    date: '2025-06-30',
    startTime: '16:00',
    endTime: '17:00',
    description: '6월 마지막 이벤트',
    location: '광주',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '5',
    title: 'Event 5',
    date: '2025-07-31',
    startTime: '18:00',
    endTime: '19:00',
    description: 'July 마지막 이벤트',
    location: 'Seoul',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    // 2025-07-01은 화요일, 주간은 6/29(일)~7/5(토)
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(result.map((e) => e.id).sort()).toEqual(['1', '2', '4']);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-15'), 'month');
    // 7월에 해당하는 이벤트: 1,2,3,5
    expect(result.map((e) => e.id).sort()).toEqual(['1', '2', '3', '5']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    // 2025-07-01 주간: 6/29~7/5, '이벤트' 포함: 1,2,4
    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');
    expect(result.map((e) => e.id).sort()).toEqual(['1', '2', '4']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    // 월간 뷰 7월
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result.map((e) => e.id).sort()).toEqual(['1', '2', '3', '5']);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, 'event 5', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('5');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    // 7월 31일 이벤트 포함
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result.map((e) => e.id)).toContain('5');
    // 6월 30일 이벤트는 7월에 포함되지 않아야 함
    expect(result.map((e) => e.id)).not.toContain('4');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'week');
    expect(result).toEqual([]);
  });
});
