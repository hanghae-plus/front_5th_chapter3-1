import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch';
import { Event } from '../../types';

describe('useSearch', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 회의',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-07-28',
      startTime: '12:00',
      endTime: '13:00',
      description: '팀 점심',
      location: '식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-07-01'), 'month'));
    expect(result.current.filteredEvents).toHaveLength(2);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-07-01'), 'month'));
    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('1');
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-07-01'), 'month'));
    act(() => {
      result.current.setSearchTerm('식당');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('2');
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-07-01'), 'week'));
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('1');
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-07-01'), 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('1');

    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('2');
  });
});
