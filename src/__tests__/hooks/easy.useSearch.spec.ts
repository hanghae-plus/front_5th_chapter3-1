import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 회의',
    location: '회의실 A',
    category: '회의',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 30,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-10-02',
    startTime: '12:00',
    endTime: '13:00',
    description: '팀 점심',
    location: '식당',
    category: '식사',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
  {
    id: '3',
    title: '프로젝트 회의',
    date: '2025-10-15',
    startTime: '14:00',
    endTime: '15:00',
    description: '프로젝트 진행 상황 논의',
    location: '회의실 B',
    category: '회의',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const currentDate = new Date('2025-10-01');
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  expect(result.current.filteredEvents).toHaveLength(3);
  expect(result.current.filteredEvents).toEqual(mockEvents);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const currentDate = new Date('2025-10-01');
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents.map((event) => event.title)).toEqual([
    '팀 회의',
    '프로젝트 회의',
  ]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const currentDate = new Date('2025-10-01');
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('식당');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 약속');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const currentDate = new Date('2025-10-01');
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'week'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('팀 회의');
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const currentDate = new Date('2025-10-01');
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(2);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 약속');
});
