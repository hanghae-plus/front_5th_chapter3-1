import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

describe('useSearch', () => {
  let events: Event[] = [];

  beforeEach(() => {
    events = [
      {
        id: '1',
        title: 'A팀 회의',
        date: '2025-05-13',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 업무 점검',
        location: '회의실 A',
        category: '회의',
        repeat: {
          type: 'none',
          interval: 0,
          endDate: undefined,
        },
        notificationTime: 15,
      },
      {
        id: '2',
        title: 'A팀 발표',
        date: '2025-05-15',
        startTime: '10:00',
        endTime: '11:00',
        description: 'A팀 발표',
        location: '회의실 B',
        category: '회의',
        repeat: {
          type: 'none',
          interval: 0,
          endDate: undefined,
        },
        notificationTime: 15,
      },
      {
        id: '3',
        title: 'A팀 점심',
        date: '2025-05-30',
        startTime: '12:00',
        endTime: '13:00',
        description: 'A팀 점심 회식',
        location: 'A팀 회식 장소',
        category: '회식',
        repeat: {
          type: 'none',
          interval: 0,
          endDate: undefined,
        },
        notificationTime: 15,
      },
    ];
  });

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const currentDate = new Date('2025-05-15');
    const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

    // ✅ 검색어가 비어 있는지 확인
    expect(result.current.searchTerm).toBe('');

    // ✅ 모든 이벤트 반환
    expect(result.current.filteredEvents).toEqual(events);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const currentDate = new Date('2025-05-15');
    const { result } = renderHook(() => useSearch(events, currentDate, 'week'));

    act(() => {
      // ✅ 검색어를 '회의'로 설정
      result.current.setSearchTerm('회의');
    });

    // ✅ 검색어에 맞는 이벤트만 필터링되어 있는지 확인
    expect(result.current.filteredEvents).toHaveLength(2);

    // ✅ 해당 이벤트들의 id가 맞는지 확인
    expect(result.current.filteredEvents[0].id).toBe('1');
    expect(result.current.filteredEvents[1].id).toBe('2');

    // ✅ 제목에 '회의'가 포함되어 있는지 확인
    expect(result.current.filteredEvents[0].title).toContain('회의');
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const currentDate = new Date('2025-05-15');
    const { result } = renderHook(() => useSearch(events, currentDate, 'week'));

    const searchTerm = '회의실';

    act(() => {
      // ✅ 검색어를 '회의실'로 설정
      result.current.setSearchTerm(searchTerm);
    });

    // ✅ 검색어에 맞는 이벤트가 2개인지 확인
    expect(result.current.filteredEvents).toHaveLength(2);

    // ✅ 검색어에 맞는 이벤트만 필터링되어 있는지 확인
    expect(result.current.filteredEvents).toEqual([events[0], events[1]]);

    // ✅ 각 항목에 검색어가 포함되어 있는지 확인
    expect(
      result.current.filteredEvents.every(
        (event) =>
          event.title.includes(searchTerm) ||
          event.description.includes(searchTerm) ||
          event.location.includes(searchTerm)
      )
    ).toBe(true);
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const currentDate = new Date('2025-05-15');

    // ✅ 주간 뷰(이번 주)에서 2025-05-13, 2025-05-15, 2개의 이벤트만 반환되어야 한다
    const { result: weekResult } = renderHook(() => useSearch(events, currentDate, 'week'));
    expect(weekResult.current.filteredEvents).toHaveLength(2);

    // ✅ 월간 뷰(이번 달)에서 2025-05-13, 2025-05-15, 2025-05-30, 3개의 이벤트만 반환되어야 한다
    const { result: monthResult } = renderHook(() => useSearch(events, currentDate, 'month'));
    expect(monthResult.current.filteredEvents).toHaveLength(3);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const currentDate = new Date('2025-05-15');
    const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

    act(() => {
      // ✅ 검색어를 '회의'로 설정
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredEvents[0].id).toBe('1');
    expect(result.current.filteredEvents[1].id).toBe('2');

    act(() => {
      // ✅ 검색어를 '회의'에서 '점심'으로 변경
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('3');
  });
});
