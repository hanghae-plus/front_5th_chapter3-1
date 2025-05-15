import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { mockTestDataList } from '../data/mockTestData.ts';

const weekStart = new Date('2025-05-02');
const monthDate = new Date('2025-05-01');

it('검색어가 비어 있을 때 주간 뷰에 속한 모든 이벤트를 반환해야 한다', () => {
  const events = mockTestDataList;
  const { result } = renderHook(() => useSearch(events, weekStart, 'week'));

  const ids = result.current.filteredEvents.map((e) => e.id);
  expect(ids.sort()).toEqual(['1', '2', '3']);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const events = mockTestDataList;
  const { result } = renderHook(() => useSearch(events, weekStart, 'week'));

  act(() => {
    result.current.setSearchTerm('Event A');
  });
  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1']);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const events = mockTestDataList;
  const { result } = renderHook(() => useSearch(events, weekStart, 'week'));

  act(() => {
    result.current.setSearchTerm('회의실');
  });
  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2', '3']);
});

it('뷰 유형에 따라 주간 뷰는 해당 주 이벤트만, 월간 뷰는 해당 월 이벤트만 반환해야 한다', () => {
  const events = mockTestDataList;
  const weekHook = renderHook(() => useSearch(events, weekStart, 'week'));
  expect(weekHook.result.current.filteredEvents.map((e) => e.id).sort()).toEqual(['1', '2', '3']);

  // — 월간 뷰 테스트 —
  const monthHook = renderHook(() => useSearch(events, monthDate, 'month'));
  // sampleEvents 중 date 7/02,7/02,7/03,7/10 → id 1,2,3,4
  expect(monthHook.result.current.filteredEvents.map((e) => e.id).sort()).toEqual([
    '1',
    '2',
    '3',
    '4',
  ]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const events = mockTestDataList;
  const { result } = renderHook(() => useSearch(events, weekStart, 'week'));

  // 1) 초기(빈 검색어) → [1,2,3]
  expect(result.current.filteredEvents.map((e) => e.id).sort()).toEqual(['1', '2', '3']);

  // 2) '회의' 입력 → ['1','2','3']
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2', '3']);

  // 3) '점심' 입력 → []
  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents.map((e) => e.id).sort()).toEqual([]);
});
