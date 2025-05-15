import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    id: '1',
    title: 'Event 1',
    description: 'Event 1 description',
    location: 'Event 1 location',
    date: '2025-05-01',
    startTime: '10:00',
    endTime: '11:00',
    category: 'event',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
  {
    id: '2',
    title: 'Event 2',
    description: 'Event 2 description',
    location: 'Event 2 location',
    date: '2025-05-02',
    startTime: '10:00',
    endTime: '11:00',
    category: 'event',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
  {
    id: '3',
    title: 'Event 3',
    description: 'Event 3 description',
    location: 'Event 3 location',
    date: '2025-05-15',
    startTime: '10:00',
    endTime: '11:00',
    category: 'event',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
  {
    id: '4',
    title: 'Event 4',
    description: 'Event 4 description - 점심',
    location: 'Event 4 location',
    date: '2025-05-16',
    startTime: '10:00',
    endTime: '11:00',
    category: 'event',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-01'), 'month'));

  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('Event 1');
  });

  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('Event 1 description');
  });

  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-01'), 'week'));

  expect(result.current.filteredEvents).toEqual([events[0], events[1]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([events[3]]);
});
