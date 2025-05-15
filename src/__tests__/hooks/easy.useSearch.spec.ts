import { act, renderHook } from '@testing-library/react';
import { useSearch } from '../../hooks/useSearch.ts';
import { mockEvents } from '../utils/mockEvent.ts';

describe('useSearch', () => {
  const currentDate = new Date('2025-10-01');

  it('검색어가 없을 때 월간 뷰에서는 10월의 이벤트만 반환되어야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));
    const dates = result.current.filteredEvents.map((e) => e.date);

    expect(dates.every((date) => date.startsWith('2025-10'))).toBe(true);
  });

  it("검색어가 '점심'이면 해당 제목을 포함한 이벤트가 있어야 한다", () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('점심');
    });

    const titles = result.current.filteredEvents.map((e) => e.title);

    expect(titles.some((title) => title.includes('점심'))).toBe(true);
  });

  it('검색어가 제목에 포함된 경우 해당 이벤트가 포함되어야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    const titles = result.current.filteredEvents.map((e) => e.title);

    expect(titles.some((title) => title.includes('회의'))).toBe(true);
  });

  it('검색어가 위치에 포함된 경우 해당 이벤트가 포함되어야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('회의실');
    });

    const locations = result.current.filteredEvents.map((e) => e.location);

    expect(locations.some((location) => location.includes('회의실'))).toBe(true);
  });

  it('검색어가 설명에 포함된 경우 해당 이벤트가 포함되어야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('동료');
    });

    const descriptions = result.current.filteredEvents.map((e) => e.description);

    expect(descriptions.some((desc) => desc.includes('동료'))).toBe(true);
  });

  it('주간 뷰에서는 현재 주(10월 1일 포함)에 해당하는 이벤트만 반환한다', () => {
    const weekDate = new Date('2025-10-01');
    const { result } = renderHook(() => useSearch(mockEvents, weekDate, 'week'));
    const dates = result.current.filteredEvents.map((e) => e.date);

    expect(dates.every((date) => date.startsWith('2025-10'))).toBe(true);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 결과도 즉시 반영된다", () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    const titlesAfterFirstSearch = result.current.filteredEvents.map((e) => e.title);

    expect(titlesAfterFirstSearch.some((title) => title.includes('회의'))).toBe(true);

    act(() => {
      result.current.setSearchTerm('점심');
    });

    const titlesAfterSecondSearch = result.current.filteredEvents.map((e) => e.title);

    expect(titlesAfterSecondSearch.some((title) => title.includes('점심'))).toBe(true);
  });
});
