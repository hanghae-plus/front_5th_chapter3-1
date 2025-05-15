import { act, renderHook, waitFor } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    id: '1',
    title: '회의',
    description: '팀 회의',
    location: '회의실 A',
    startTime: '2025-10-01',
    endTime: '2025-10-01',
    date: '',
    category: '',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
  {
    id: '2',
    title: '점심',
    description: '점심 약속',
    location: '식당 B',
    startTime: '2025-10-02',
    endTime: '2025-10-02',
    date: '',
    category: '',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'week'));

  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2']);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('식당 B');
  });

  expect(result.current.filteredEvents).toEqual([events[1]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'week'));

  expect(result.current.filteredEvents).toEqual(events);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([events[1]]);
});
