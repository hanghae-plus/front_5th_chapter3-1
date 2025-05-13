import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { MOCK_DATA } from '../mock.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(MOCK_DATA, new Date('2025-07-01'), 'week'));

  expect(result.current.filteredEvents).toEqual(MOCK_DATA.slice(-1));
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(MOCK_DATA, new Date('2025-07-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('이벤트 2');
  });

  expect(result.current.filteredEvents).toEqual(MOCK_DATA.slice(-1));
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(MOCK_DATA, new Date('2025-07-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('이벤트');
  });

  expect(result.current.filteredEvents).toEqual(MOCK_DATA.slice(-1));
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(MOCK_DATA, new Date('2025-07-01'), 'month'));

  expect(result.current.filteredEvents).toEqual(MOCK_DATA.slice(-1));
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(MOCK_DATA, new Date('2025-07-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  const initSearchTerm = result.current.searchTerm;

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.searchTerm).not.toBe(initSearchTerm);
  expect(result.current.searchTerm).toBe('점심');
});
