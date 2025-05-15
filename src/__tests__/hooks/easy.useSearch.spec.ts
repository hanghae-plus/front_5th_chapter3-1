import { act, renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const MOCK_EVENTS = [...events] as Event[];

type SearchResult = ReturnType<typeof useSearch>;

describe('useSearch', () => {
  let result: { current: SearchResult };

  beforeEach(() => {
    const hook = renderHook(() => useSearch(MOCK_EVENTS, new Date('2025-10-01'), 'month'));
    result = hook.result;
  });

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    expect(result.current.filteredEvents.length).toBe(MOCK_EVENTS.length);
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const searchKeyword = '회의';
    act(() => {
      result.current.setSearchTerm(searchKeyword);
    });

    const filteredEvents = result.current.filteredEvents;
    const expectedEvents = MOCK_EVENTS.filter(
      (event) =>
        event.title.includes(searchKeyword) ||
        event.description.includes(searchKeyword) ||
        event.location.includes(searchKeyword)
    );

    expect(filteredEvents.map((e) => e.id)).toEqual(expectedEvents.map((e) => e.id));
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    // 주간 뷰 hook
    const hook = renderHook(() => useSearch(MOCK_EVENTS, new Date('2025-10-01'), 'week'));
    result = hook.result;

    // 검색어 ""
    act(() => {
      result.current.setSearchTerm('');
    });

    const filteredEvents = result.current.filteredEvents;

    const weekStart = new Date('2025-09-28'); // 해당 주의 일요일
    const weekEnd = new Date('2025-10-04'); // 해당 주의 토요일

    const expectedEvents = MOCK_EVENTS.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });

    expect(filteredEvents).toEqual(expectedEvents);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    // 검색어 "회의"
    act(() => {
      result.current.setSearchTerm('회의');
    });

    const previousEvents = result.current.filteredEvents;

    // 검색어 "점심"으로 변경
    act(() => {
      result.current.setSearchTerm('점심');
    });

    const currentEvents = result.current.filteredEvents;

    // 값은 같을 수 있으므로 toEquals가 아닌 toBe?
    expect(previousEvents).not.toBe(currentEvents);
  });
});
