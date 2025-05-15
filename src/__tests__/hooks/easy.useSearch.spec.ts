import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '이벤트 1 설명',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2025-07-02',
    startTime: '09:00',
    endTime: '10:00',
    description: '이벤트 2 설명',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '이벤트 3',
    date: '2025-07-03',
    startTime: '09:00',
    endTime: '10:00',
    description: '이벤트 3 설명',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '주간보고',
    date: '2025-07-03',
    startTime: '09:00',
    endTime: '10:00',
    description: '주간보고 설명',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '5',
    title: '이벤트 5',
    date: '2025-07-10',
    startTime: '09:00',
    endTime: '10:00',
    description: '이벤트 5 설명',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '6',
    title: 'Event 6',
    date: '2025-07-10',
    startTime: '09:00',
    endTime: '10:00',
    description: 'Event 6 설명',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '7',
    title: '점심',
    date: '2025-07-10',
    startTime: '09:00',
    endTime: '10:00',
    description: '점심',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime('2025-07-01');
});

afterEach(() => {
  vi.useRealTimers();
});

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  // filteredEvents
  const events = mockEvents;
  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const events = mockEvents;
  const { result } = renderHook(() => useSearch(events, new Date(), 'week'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents[0].id).toBe('1');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const events = mockEvents;
  const { result } = renderHook(() => useSearch(events, new Date(), 'week'));

  act(() => {
    result.current.setSearchTerm('주간보고');
  });

  expect(result.current.filteredEvents[0].id).toBe('4');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const events = mockEvents;
  const { result: weekResult } = renderHook(() => useSearch(events, new Date(), 'week'));
  expect(weekResult.current.filteredEvents.length).toBe(4);

  const { result: monthResult } = renderHook(() => useSearch(events, new Date(), 'month'));
  expect(monthResult.current.filteredEvents.length).toBe(7);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const events = mockEvents;
  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents[0].id).toBe('1');

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents[0].id).toBe('7');
});
