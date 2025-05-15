import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의',
      location: '회의실 A',
      category: 'work',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심',
      date: '2025-10-02',
      startTime: '12:00',
      endTime: '13:00',
      description: '점심 회식',
      location: '식당 B',
      category: 'social',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 5,
    },
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'month'));

  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의',
      location: '회의실 A',
      category: 'work',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심',
      date: '2025-10-02',
      startTime: '12:00',
      endTime: '13:00',
      description: '점심 회식',
      location: '식당 B',
      category: 'social',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 5,
    },
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의',
      location: '회의실 A',
      category: 'work',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심',
      date: '2025-10-02',
      startTime: '12:00',
      endTime: '13:00',
      description: '점심 회식',
      location: '식당 B',
      category: 'social',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 5,
    },
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의실 A');
  });

  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의',
      location: '회의실 A',
      category: 'work',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심',
      date: '2025-10-10',
      startTime: '12:00',
      endTime: '13:00',
      description: '점심 회식',
      location: '식당 B',
      category: 'social',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 5,
    },
  ];

  const { result, rerender } = renderHook(
    ({ view }: { view: 'week' | 'month' }) => useSearch(events, new Date('2025-10-01'), view),
    {
      initialProps: { view: 'month' },
    }
  );

  expect(result.current.filteredEvents).toEqual(events);

  rerender({ view: 'week' });

  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const events: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의',
      location: '회의실 A',
      category: 'work',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심',
      date: '2025-10-02',
      startTime: '12:00',
      endTime: '13:00',
      description: '점심 회식',
      location: '식당 B',
      category: 'social',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 5,
    },
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([events[0]]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([events[1]]);
});
