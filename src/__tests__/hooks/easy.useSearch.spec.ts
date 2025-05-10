import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const SAMPLE_EVENTS: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '이벤트 1 설명',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '2',
    title: '이벤트 2 점심',
    date: '2025-10-22',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트 2 설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '3',
    title: '이벤트 3',
    date: '2025-11-17',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트 3 설명',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(SAMPLE_EVENTS, new Date('2025-10-15'), 'month'));
  expect(result.current.filteredEvents).toEqual([SAMPLE_EVENTS[0], SAMPLE_EVENTS[1]]);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(SAMPLE_EVENTS, new Date('2025-10-15'), 'month'));
  act(() => {
    result.current.setSearchTerm('이벤트 1');
  });
  expect(result.current.filteredEvents).toEqual([SAMPLE_EVENTS[0]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(SAMPLE_EVENTS, new Date('2025-10-15'), 'month'));
  act(() => {
    // 제목 비교
    result.current.setSearchTerm('이벤트 1');
  });
  expect(result.current.filteredEvents).toEqual([SAMPLE_EVENTS[0]]);

  act(() => {
    // 설명 비교
    result.current.setSearchTerm('이벤트 2 설명');
  });
  expect(result.current.filteredEvents).toEqual([SAMPLE_EVENTS[1]]);

  act(() => {
    // 위치 비교
    result.current.setSearchTerm('회의실 A');
  });
  expect(result.current.filteredEvents).toEqual([SAMPLE_EVENTS[1]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: resultByMonth } = renderHook(() =>
    useSearch(SAMPLE_EVENTS, new Date('2025-10-15'), 'month')
  );
  expect(resultByMonth.current.filteredEvents).toEqual([SAMPLE_EVENTS[0], SAMPLE_EVENTS[1]]);

  const { result: resultByWeek } = renderHook(() =>
    useSearch(SAMPLE_EVENTS, new Date('2025-10-15'), 'week')
  );
  expect(resultByWeek.current.filteredEvents).toEqual([SAMPLE_EVENTS[0]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(SAMPLE_EVENTS, new Date('2025-10-15'), 'month'));
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([SAMPLE_EVENTS[0], SAMPLE_EVENTS[1]]);

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toEqual([SAMPLE_EVENTS[1]]);
});
