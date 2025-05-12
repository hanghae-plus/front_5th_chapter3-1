import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

describe('검색 (useSearch)', () => {
  let events: Event[];

  beforeEach(() => {
    events = [
      {
        id: '1',
        title: '이벤트 1',
        description: '이벤트 1 설명',
        location: '이벤트 1 위치',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
        date: '2025-05-12',
        startTime: '14:30',
        endTime: '15:30',
      },
      {
        id: '2',
        title: '이벤트 2',
        description: '이벤트 2 설명 회의',
        location: '이벤트 2 위치',
        category: '이벤트 2 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
        date: '2025-05-14',
        startTime: '12:30',
        endTime: '14:30',
      },
      {
        id: '3',
        title: '이벤트 3',
        description: '이벤트 3 설명 점심',
        location: '이벤트 3 위치',
        category: '이벤트 3 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
        date: '2025-05-30',
        startTime: '13:30',
        endTime: '16:30',
      },
    ];
  });

  /**
   * @description 검색어가 비어있을 때 모든 이벤트를 반환해야 한다 -> 검색어가 비어있을 때 모든 월간 이벤트를 반환해야 한다
   */
  it('검색어가 비어있을 때 모든 월간 이벤트를 반환해야 한다', () => {
    const currentDate = new Date('2025-05-12');
    const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

    expect(result.current.filteredEvents).toEqual(events);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const currentDate = new Date('2025-05-12');
    const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('이벤트 2');
    });

    expect(result.current.filteredEvents).toEqual([events[1]]);
  });

  it('검색어가 제목의 해당하는 이벤트를 반환해야 한다', () => {
    const currentDate = new Date('2025-05-12');
    const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('이벤트 1');
    });

    expect(result.current.filteredEvents).toEqual([events[0]]);
  });

  it('검색어가 설명의 해당하는 이벤트를 반환해야 한다', () => {
    const currentDate = new Date('2025-05-12');
    const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('1 설명');
    });

    expect(result.current.filteredEvents).toEqual([events[0]]);
  });

  it('검색어가 위치의 해당하는 이벤트를 반환해야 한다', () => {
    const currentDate = new Date('2025-05-12');
    const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('1 위치');
    });

    expect(result.current.filteredEvents).toEqual([events[0]]);
  });

  /**
   * @description 현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다 -> 주간에 해당하는 이벤트만 반환해야한다.
   (주간, 월간 하나에서 다 작성하기 보다는 두개의 테스트로 분리해서 하는게 더 좋아보임.) 
   */
  it('월간 뷰에서 월간 이벤트만 반환해야 한다', () => {
    const currentDate = new Date('2025-05-12');
    const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

    expect(result.current.filteredEvents).toEqual(events);
  });

  it('주간 뷰에서 주간 이벤트만 반환해야 한다', () => {
    const currentDate = new Date('2025-05-25');
    const { result } = renderHook(() => useSearch(events, currentDate, 'week'));

    expect(result.current.filteredEvents).toEqual([events[2]]);
  });
  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const currentDate = new Date('2025-05-12');
    const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toEqual([events[1]]);

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.filteredEvents).toEqual([events[2]]);
  });
});
