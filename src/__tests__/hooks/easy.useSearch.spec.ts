import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useSearch } from '../../hooks/useSearch.ts';
import { MOCK_EVENTS } from '../mock.ts';

const currentDate = new Date('2025-07-01');
const view = 'week';

describe('useSearch', () => {
  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(MOCK_EVENTS, currentDate, view));

    expect(result.current.searchTerm).toBe('');
    expect(result.current.filteredEvents.length).toBe(1);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(MOCK_EVENTS, currentDate, view));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('이벤트 2');
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(MOCK_EVENTS, currentDate, view));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('2');
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const { result: weekResult } = renderHook(() =>
      useSearch(MOCK_EVENTS, new Date('2025-07-01'), 'week')
    );
    const { result: monthResult } = renderHook(() =>
      useSearch(MOCK_EVENTS, new Date('2025-07-01'), 'month')
    );

    expect(weekResult.current.filteredEvents).toHaveLength(1);
    expect(monthResult.current.filteredEvents).toHaveLength(3);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(MOCK_EVENTS, currentDate, view));

    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('이벤트 2');

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.filteredEvents).toHaveLength(0);
  });
});
