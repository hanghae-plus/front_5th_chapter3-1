import { act, renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/response/realEvents.json';
import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const expectedEvent = events[0];

describe('useSearch', () => {
  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events as Event[], new Date(), 'month'));
    expect(result.current.filteredEvents).toEqual(events);
  });

  it('검색어 "팀 회의"에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(events as Event[], new Date(), 'month'));
    act(() => {
      result.current.setSearchTerm('팀 회의');
    });
    expect(result.current.filteredEvents[0].title).toBe(events[0].title);
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    //filteredEvents에 serchTerm으로 들어갈 수 있는 제목, 설명, 위치가 들어올때 그에 맞는 이벤트를 리턴하는지 확인

    const { result } = renderHook(() => useSearch(events as Event[], new Date(), 'month'));

    //제목
    act(() => {
      result.current.setSearchTerm(expectedEvent.title);
    });
    expect(result.current.filteredEvents[0]).toEqual(events[0]);

    //설명
    act(() => {
      result.current.setSearchTerm(expectedEvent.description);
    });
    expect(result.current.filteredEvents[0]).toEqual(events[0]);

    //위치
    act(() => {
      result.current.setSearchTerm(expectedEvent.location);
    });
    expect(result.current.filteredEvents[0]).toEqual(events[0]);
  });

  it('주간 뷰에 해당하는 이벤트만 반환해야한다', () => {
    const { result } = renderHook(() =>
      useSearch(events as Event[], new Date('2025-05-20'), 'week')
    );
    expect(result.current.filteredEvents[0]).toEqual(events[0]);
  });

  it('월간 뷰에 해당하는 이벤트만 반환해야한다', () => {
    const { result } = renderHook(() =>
      useSearch(events as Event[], new Date('2025-05-20'), 'month')
    );
    expect(result.current.filteredEvents).toEqual(events);
  });

  it("검색어를 '팀 회의'에서 '운동'으로 변경하면 필터링된 이벤트가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(events as Event[], new Date(), 'month'));
    act(() => {
      result.current.setSearchTerm('팀 회의');
    });
    expect(result.current.filteredEvents[0].title).toBe('팀 회의');

    act(() => {
      result.current.setSearchTerm('운동');
    });
    expect(result.current.filteredEvents[0].title).toBe('운동');
  });
});
