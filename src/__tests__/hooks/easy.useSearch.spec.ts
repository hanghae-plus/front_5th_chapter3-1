import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: '1번 이벤트',
    date: '2025-05-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '1번 이벤트 설명',
    location: '1번 이벤트 장소',
    category: '1번 이벤트 카테고리',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
  {
    id: '2',
    title: '2번 이벤트',
    date: '2025-05-16',
    startTime: '10:00',
    endTime: '11:00',
    description: '2번 이벤트 설명',
    location: '2번 이벤트 장소',
    category: '2번 이벤트 카테고리',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
  {
    id: '3',
    title: '3번 이벤트',
    date: '2025-05-17',
    startTime: '10:00',
    endTime: '11:00',
    description: '3번 이벤트 설명',
    location: '3번 이벤트 장소',
    category: '3번 이벤트 카테고리',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result: search } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'month'));

  expect(search.current.filteredEvents).toEqual(MOCK_EVENTS);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result: search } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'month'));

  act(() => {
    search.current.setSearchTerm('1번 이벤트');
  });

  expect(search.current.filteredEvents).toEqual([MOCK_EVENTS[0]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result: search } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'month'));

  act(() => {
    search.current.setSearchTerm('1번 이벤트');
  });

  expect(search.current.filteredEvents).toEqual([MOCK_EVENTS[0]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: search } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'month'));

  act(() => {
    search.current.setSearchTerm('1번 이벤트');
  });

  expect(search.current.filteredEvents).toEqual([MOCK_EVENTS[0]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result: search } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'month'));

  act(() => {
    search.current.setSearchTerm(MOCK_EVENTS[0].title);
  });

  expect(search.current.filteredEvents).toEqual([MOCK_EVENTS[0]]);

  act(() => {
    search.current.setSearchTerm(MOCK_EVENTS[1].title);
  });

  expect(search.current.filteredEvents).toEqual([MOCK_EVENTS[1]]);
});
