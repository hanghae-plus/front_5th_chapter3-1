import { act, renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/response/realEvents.json';
import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents = events as Event[];

const setup = (date: Date, view: 'week' | 'month' = 'month') => {
  return renderHook(() => useSearch(mockEvents, date, view));
};

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = setup(new Date('2025-05-13'), 'month');

  expect(result.current.filteredEvents).toEqual(mockEvents);
});

it('검색어가 제목과 일치하는 이벤트만 반환한다', () => {
  const { result } = setup(new Date('2025-05-13'), 'month');

  act(() => {
    result.current.setSearchTerm('생일 파티');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('생일 파티');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = setup(new Date('2025-05-13'), 'month');

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].description).toBe('동료와 점심 식사');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = setup(new Date('2025-05-20'), 'week');

  const weekTitles = result.current.filteredEvents.map((event) => event.title);
  expect(weekTitles).toEqual(expect.arrayContaining(['팀 회의', '점심 약속', '운동']));
  expect(weekTitles).not.toContain('생일 파티');
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = setup(new Date('2025-05-20'), 'week');

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('팀 회의');

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 약속');
});
