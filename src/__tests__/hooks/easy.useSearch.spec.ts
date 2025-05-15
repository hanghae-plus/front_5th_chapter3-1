import { act, renderHook } from '@testing-library/react';

import eventsData from '../../__mocks__/response/events.json';
import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

describe('useSearch', () => {
  vi.useFakeTimers();
  vi.setSystemTime('2025-07-01');

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const events = eventsData.events as Event[];
    const { result } = renderHook(() => useSearch(events, new Date(), 'month'));
    expect(result.current.filteredEvents).toEqual(events);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const events = eventsData.events as Event[];
    const { result } = renderHook(() => useSearch(events, new Date(), 'month'));
    act(() => {
      result.current.setSearchTerm('보고');
    });
    expect(result.current.filteredEvents).toEqual([events[3]]);
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const events = eventsData.events as Event[];
    const { result } = renderHook(() => useSearch(events, new Date(), 'month'));
    act(() => {
      result.current.setSearchTerm('회의실 C');
    });
    expect(result.current.filteredEvents).toEqual([events[7]]);
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const events = eventsData.events as Event[];
    const { result } = renderHook(() => useSearch(events, new Date(), 'week'));
    act(() => {
      result.current.setSearchTerm('이벤트');
    });
    expect(result.current.filteredEvents).toEqual([events[0], events[1], events[2]]);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const events = eventsData.events as Event[];
    const { result } = renderHook(() => useSearch(events, new Date(), 'month'));
    act(() => {
      result.current.setSearchTerm('회의');
    });
    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents).toEqual([]);
  });
});
