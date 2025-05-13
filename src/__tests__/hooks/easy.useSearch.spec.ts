import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '회의 설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2025-10-03',
    startTime: '14:00',
    endTime: '15:00',
    description: '점심 약속',
    location: '식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '3',
    title: '이벤트 3',
    date: '2025-11-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '외부 미팅',
    location: '카페',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];

const currentDate = new Date('2025-10-01');
const view = 'week';

describe('useSearch', () => {
  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, currentDate, view));

    expect(result.current.searchTerm).toBe('');
    expect(result.current.filteredEvents.length).toBe(2);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, currentDate, view));

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('이벤트 2');
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, currentDate, view));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('1');
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const { result: weekResult } = renderHook(() =>
      useSearch(events, new Date('2025-10-01'), 'week')
    );
    const { result: monthResult } = renderHook(() =>
      useSearch(events, new Date('2025-10-01'), 'month')
    );

    expect(weekResult.current.filteredEvents).toHaveLength(2);
    expect(monthResult.current.filteredEvents).toHaveLength(2);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(events, currentDate, view));

    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('이벤트 1');

    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('이벤트 2');
  });
});
