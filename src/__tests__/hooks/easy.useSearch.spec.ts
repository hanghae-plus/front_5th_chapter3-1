import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    id: '1',
    title: '이벤트1 회의',
    date: '2025-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트1 설명',
    location: '이벤트1 위치',
    category: '이벤트1 카테고리',
    repeat: { type: 'daily', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '이벤트2 점심',
    date: '2025-10-11',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트2 설명',
    location: '이벤트2 위치',
    category: '이벤트2 카테고리',
    repeat: { type: 'daily', interval: 1 },
    notificationTime: 10,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));
  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));
  act(() => {
    result.current.setSearchTerm('이벤트1');
  });
  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));
  act(() => {
    result.current.setSearchTerm('이벤트1');
  });
  expect(result.current.filteredEvents).toEqual([events[0]]);
  act(() => {
    result.current.setSearchTerm('이벤트1 설명');
  });
  expect(result.current.filteredEvents).toEqual([events[0]]);
  act(() => {
    result.current.setSearchTerm('이벤트1 위치');
  });
  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date(), 'week'));
  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([events[0]]);
  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toEqual([events[1]]);
});
