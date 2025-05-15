import { act, renderHook } from '@testing-library/react';

import { formatDate } from '../../based/utils/dateUtils.ts';
import { useSearch } from '../../features/event/model/useSearch.ts';
import { Event } from '../../types.ts';

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: '회의',
    date: formatDate(new Date()),
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트 1 설명',
    location: '이벤트 1 위치',
    category: '이벤트 1 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '2',
    title: '점심',
    date: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트 2 설명',
    location: '이벤트 2 위치',
    category: '이벤트 2 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환한다.', () => {
  const { result } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'month'));

  expect(result.current.filteredEvents).toEqual(MOCK_EVENTS);
});

it('검색어가 이벤트 제목과 일치할 때 해당 이벤트만 반환한다.', () => {
  const { result } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm(MOCK_EVENTS[0].title);
  });

  expect(result.current.filteredEvents).toEqual([MOCK_EVENTS[0]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환한다.', () => {
  const { result } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm(MOCK_EVENTS[0].title);
  });

  expect(result.current.filteredEvents).toEqual([MOCK_EVENTS[0]]);

  act(() => {
    result.current.setSearchTerm(MOCK_EVENTS[0].description);
  });

  expect(result.current.filteredEvents).toEqual([MOCK_EVENTS[0]]);

  act(() => {
    result.current.setSearchTerm(MOCK_EVENTS[0].location);
  });

  expect(result.current.filteredEvents).toEqual([MOCK_EVENTS[0]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환한다.', () => {
  const { result } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'month'));

  expect(result.current.filteredEvents).toEqual(MOCK_EVENTS);

  const { result: result2 } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'week'));

  expect(result2.current.filteredEvents).toEqual([MOCK_EVENTS[0]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트된다.", () => {
  const { result } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm(MOCK_EVENTS[0].title);
  });

  expect(result.current.filteredEvents).toEqual([MOCK_EVENTS[0]]);

  act(() => {
    result.current.setSearchTerm(MOCK_EVENTS[1].title);
  });

  expect(result.current.filteredEvents).toEqual([MOCK_EVENTS[1]]);
});
