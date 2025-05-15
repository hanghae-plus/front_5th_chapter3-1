import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { createEvent, getTestEvents } from '../fixtures/eventFactory.ts';

describe('useSearch hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime('2025-07-15T00:00:00.000Z');
  });

  const testEvents = getTestEvents('filter');
  const testDate = new Date('2025-07-15');

  const julyEvents = testEvents.filter(
    (event) =>
      new Date(event.date).getMonth() === testDate.getMonth() &&
      new Date(event.date).getFullYear() === testDate.getFullYear()
  );

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(testEvents, testDate, 'month'));

    expect(result.current.searchTerm).toBe('');
    expect(result.current.filteredEvents.length).toBe(4);
    expect(result.current.filteredEvents).toEqual(expect.arrayContaining(julyEvents.slice(0, 3)));
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(testEvents, testDate, 'month'));

    act(() => result.current.setSearchTerm('회의'));

    expect(result.current.searchTerm).toBe('회의');
    expect(result.current.filteredEvents.length).toBeLessThan(julyEvents.length);
    expect(
      result.current.filteredEvents.every(
        (event) =>
          event.title.toLowerCase().includes('회의') ||
          event.description.toLowerCase().includes('회의') ||
          event.location.toLowerCase().includes('회의')
      )
    ).toBe(true);
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const testDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`;

    const mixedEvents = [
      createEvent({
        id: 'title-match',
        title: '점심 약속',
        description: '업무 회의',
        location: '사무실',
        date: testDateStr,
      }),
      createEvent({
        id: 'desc-match',
        title: '저녁 약속',
        description: '점심 이후 회의',
        location: '카페',
        date: testDateStr,
      }),
      createEvent({
        id: 'loc-match',
        title: '아침 약속',
        description: '업무 계획',
        location: '점심식당',
        date: testDateStr,
      }),
      createEvent({
        id: 'no-match',
        title: '미팅',
        description: '업무 논의',
        location: '회의실',
        date: testDateStr,
      }),
    ];

    const { result } = renderHook(() => useSearch(mixedEvents, currentDate, 'month'));

    act(() => result.current.setSearchTerm('점심'));

    expect(result.current.filteredEvents.length).toBe(3);
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(
      expect.arrayContaining(['title-match', 'desc-match', 'loc-match'])
    );
    expect(result.current.filteredEvents.map((e) => e.id)).not.toContain('no-match');
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const july1stEvents = [
      createEvent({ id: 'july-week1-1', date: '2025-07-01' }),
      createEvent({ id: 'july-week1-2', date: '2025-07-02' }),
    ];

    const july15thEvents = [
      createEvent({ id: 'july-week3-1', date: '2025-07-15' }),
      createEvent({ id: 'july-week3-2', date: '2025-07-16' }),
    ];

    const allEvents = [...july1stEvents, ...july15thEvents];

    const weekResult = renderHook(() => useSearch(allEvents, new Date('2025-07-01'), 'week'));
    expect(weekResult.result.current.filteredEvents.length).toBe(2);
    expect(weekResult.result.current.filteredEvents.map((e) => e.id)).toEqual(
      expect.arrayContaining(['july-week1-1', 'july-week1-2'])
    );

    const monthResult = renderHook(() => useSearch(allEvents, new Date('2025-07-15'), 'month'));
    expect(monthResult.result.current.filteredEvents.length).toBe(4);
    expect(monthResult.result.current.filteredEvents.map((e) => e.id)).toEqual(
      expect.arrayContaining(['july-week1-1', 'july-week1-2', 'july-week3-1', 'july-week3-2'])
    );
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const testDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`;

    const searchableEvents = [
      createEvent({
        id: '1',
        title: '회의',
        description: '정기 회의',
        location: '회의실',
        date: testDateStr,
      }),
      createEvent({
        id: '2',
        title: '점심',
        description: '팀 점심',
        location: '식당',
        date: testDateStr,
      }),
      createEvent({
        id: '3',
        title: '회의 및 점심',
        description: '회의 후 점심',
        location: '회의실',
        date: testDateStr,
      }),
    ];

    const { result } = renderHook(() => useSearch(searchableEvents, currentDate, 'week'));

    act(() => result.current.setSearchTerm('회의'));

    expect(result.current.searchTerm).toBe('회의');
    expect(result.current.filteredEvents.length).toBe(2);
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(
      expect.arrayContaining(['1', '3'])
    );

    act(() => result.current.setSearchTerm('점심'));

    expect(result.current.searchTerm).toBe('점심');
    expect(result.current.filteredEvents.length).toBe(2);
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(
      expect.arrayContaining(['2', '3'])
    );
  });
});
