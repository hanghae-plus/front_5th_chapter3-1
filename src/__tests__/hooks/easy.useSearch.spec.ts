import { act, renderHook } from '@testing-library/react';
import { a } from 'framer-motion/client';

import { Event } from '../../entities/event/model/types.ts';
import { useSearch } from '../../features/search/model/useSearch.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const events: Event[] = [
    {
      id: 1,
      description: '이벤트 1',
      title: '이벤트 1',
      location: '장소 1',
      date: '2025-07-01',
    },
    {
      id: 2,
      description: '이벤트 2',
      title: '이벤트 2',
      location: '장소 2',
      date: '2025-07-03',
    },
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'week'));

  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const events: Event[] = [
    {
      id: 1,
      description: '이벤트 1',
      title: '이벤트 1',
      location: '장소 1',
      date: '2025-07-01',
    },
    {
      id: 2,
      description: '이벤트 2',
      title: '이벤트 2',
      location: '장소 2',
      date: '2025-07-03',
    },
  ];

  const { result } = renderHook(() =>
    useSearch(events, new Date('2025-07-01'), 'week', '이벤트 2')
  );

  act(() => {
    result.current.setSearchTerm('이벤트 2');
  });

  expect(result.current.filteredEvents).toEqual([events[1]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const events: Event[] = [
    {
      id: 1,
      description: '이벤트 1',
      title: '이벤트 1',
      location: '장소 1',
      date: '2025-07-01',
    },
    {
      id: 2,
      description: '이벤트 2',
      title: '이벤트 2',
      location: '장소 2',
      date: '2025-07-03',
    },
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('장소 2');
  });

  expect(result.current.filteredEvents).toEqual([events[1]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const events: Event[] = [
    {
      id: 1,
      description: '이벤트 1',
      title: '이벤트 1',
      location: '장소 1',
      date: '2025-07-01',
    },
    {
      id: 2,
      description: '이벤트 2',
      title: '이벤트 2',
      location: '장소 2',
      date: '2025-07-03',
    },
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'week'));
  act(() => {
    result.current.setSearchTerm('이벤트 1');
  });

  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const events: Event[] = [
    {
      id: 1,
      description: '회의',
      title: '회의',
      location: '장소 1',
      date: '2025-07-01',
    },
    {
      id: 2,
      description: '점심',
      title: '점심',
      location: '장소 2',
      date: '2025-07-03',
    },
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([events[0]]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([events[1]]);
});
