import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    id: '1',
    title: '회의1',
    date: '2025-05-24',
    startTime: '13:00',
    endTime: '14:00',
    description: '회의',
    location: '회의실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '2',
    title: '테스트',
    date: '2025-05-25',
    startTime: '13:00',
    endTime: '14:00',
    description: 'QA팀',
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '3',
    title: '힘들다',
    date: '2025-05-26',
    startTime: '13:00',
    endTime: '14:00',
    description: '운동',
    location: '체육관',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '4',
    title: '점심',
    date: '2025-05-31',
    startTime: '12:00',
    endTime: '14:00',
    description: '밥',
    location: '식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-01'), 'month'));
  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-01'), 'month'));
  act(() => result.current.setSearchTerm('회의1'));
  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-01'), 'month'));
  act(() => result.current.setSearchTerm('체육관'));
  expect(result.current.filteredEvents).toEqual([events[2]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-21'), 'week'));
  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-01'), 'month'));
  act(() => result.current.setSearchTerm('회의'));
  expect(result.current.filteredEvents).toEqual([events[0]]);
  act(() => result.current.setSearchTerm('점심'));
  expect(result.current.filteredEvents).toEqual([events[3]]);
});
