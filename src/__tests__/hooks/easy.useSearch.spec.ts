import { renderHook, act } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch';
import { Event } from '../../types';

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: '주간 회의',
    description: '팀 회의',
    location: '회의실 A',
    category: '업무',
    date: '2025-10-15',
    startTime: '10:00',
    endTime: '11:00',
    notificationTime: 10,
    repeat: { type: 'none', interval: 0 },
  },
  {
    id: '2',
    title: '점심 약속',
    description: '지인과의 점심',
    location: '식당',
    category: '개인',
    date: '2025-10-16',
    startTime: '12:00',
    endTime: '13:00',
    notificationTime: 10,
    repeat: { type: 'none', interval: 0 },
  },
  {
    id: '3',
    title: '과거 일정',
    description: '지난 회의',
    location: '회의실 B',
    category: '업무',
    date: '2025-09-01',
    startTime: '10:00',
    endTime: '11:00',
    notificationTime: 10,
    repeat: { type: 'none', interval: 0 },
  },
];

describe('useSearch 훅 테스트', () => {
  const currentDate = new Date('2025-10-15'); // 기준 날짜 (10월 3째 주 수요일)

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(MOCK_EVENTS, currentDate, 'month'));

    expect(result.current.filteredEvents.length).toBe(2);
    expect(result.current.filteredEvents.map((e) => e.id)).toContain('1');
    expect(result.current.filteredEvents.map((e) => e.id)).toContain('2');
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(MOCK_EVENTS, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.filteredEvents.length).toBe(1);
    expect(result.current.filteredEvents[0].title).toBe('점심 약속');
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(MOCK_EVENTS, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('회의실 A');
    });

    expect(result.current.filteredEvents.length).toBe(1);
    expect(result.current.filteredEvents[0].id).toBe('1');
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const weekDate = new Date('2025-10-15'); // 수요일

    const { result } = renderHook(() => useSearch(MOCK_EVENTS, weekDate, 'week'));

    expect(result.current.filteredEvents.length).toBe(2);
    const dates = result.current.filteredEvents.map((e) => e.date);
    expect(dates).toContain('2025-10-15');
    expect(dates).toContain('2025-10-16');
    expect(dates).not.toContain('2025-09-01');
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(MOCK_EVENTS, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents.length).toBe(1);
    expect(result.current.filteredEvents[0].id).toBe('1');

    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents.length).toBe(1);
    expect(result.current.filteredEvents[0].id).toBe('2');
  });
});
