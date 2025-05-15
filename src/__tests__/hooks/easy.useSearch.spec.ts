import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    id: '1',
    title: '회의',
    description: '회의 설명',
    location: '회의 위치',
    date: '2025-01-01',
    startTime: '10:00',
    endTime: '11:00',
    category: '회의',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 0,
  },
  {
    id: '2',
    title: '점심',
    description: '점심 설명',
    location: '점심 위치',
    date: '2025-01-02',
    startTime: '12:00',
    endTime: '13:00',
    category: '점심',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 0,
  },
  {
    id: '3',
    title: '운동',
    description: '운동 설명',
    location: '운동 위치',
    date: '2025-01-31',
    startTime: '14:00',
    endTime: '15:00',
    category: '운동',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 0,
  },
];

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime('2025-01-01');
});

afterEach(() => {
  vi.useRealTimers();
});

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  // filteredEvents
  const { result } = renderHook(() => useSearch(events, new Date(), 'week'));

  expect(result.current.filteredEvents.length).toBe(2);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date(), 'week'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents[0].id).toBe('1');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date(), 'week'));

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents[0].id).toBe('2');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: weekResult } = renderHook(() => useSearch(events, new Date(), 'week'));

  expect(weekResult.current.filteredEvents.length).toBe(2);

  const { result: monthResult } = renderHook(() => useSearch(events, new Date(), 'month'));

  expect(monthResult.current.filteredEvents.length).toBe(2);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, new Date(), 'week'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents[0].id).toBe('1');

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents[0].id).toBe('2');
});
