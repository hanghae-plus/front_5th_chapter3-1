import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

// 총 5개

const EVENTS: Event[] = [
  {
    id: '1',
    title: '출근',
    date: '2025-05-12',
    startTime: '08:00',
    endTime: '09:00',
    description: '하기싫은 출근',
    location: '회사',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 식사',
    date: '2025-05-12',
    startTime: '12:00',
    endTime: '13:00',
    description: '점심 식사',
    location: '식껍',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
  {
    id: '3',
    title: '회식',
    date: '2025-05-13',
    startTime: '18:00',
    endTime: '22:00',
    description: '양재에서 팀 회식',
    location: '양재',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 60,
  },
  {
    id: '4',
    title: '등산',
    date: '2025-06-07',
    startTime: '11:00',
    endTime: '13:00',
    description: '아차산 둘레길',
    location: '아차산',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 30,
  },
  {
    id: '5',
    title: '항해 수료식',
    date: '2025-06-07',
    startTime: '13:00',
    endTime: '18:00',
    description: '굿바이 항해',
    location: '아이콘빌딩역삼',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  },
];

const CURRENT_DATE = new Date(2025, 4, 15);

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result: weekResult } = renderHook(() => useSearch(EVENTS, CURRENT_DATE, 'week'));
  expect(weekResult.current.filteredEvents).toHaveLength(3);
  expect(weekResult.current.filteredEvents.map((e) => e.id).sort()).toEqual(['1', '2', '3']);

  const { result: monthResult } = renderHook(() => useSearch(EVENTS, CURRENT_DATE, 'month'));
  expect(monthResult.current.filteredEvents).toHaveLength(3);
  expect(monthResult.current.filteredEvents.map((e) => e.id).sort()).toEqual(['1', '2', '3']);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(EVENTS, CURRENT_DATE, 'week'));

  act(() => {
    result.current.setSearchTerm('회식');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents.map((e) => e.id).sort()).toEqual(['3']);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].id).toBe('2');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(EVENTS, CURRENT_DATE, undefined as any));

  act(() => {
    result.current.setSearchTerm('출근');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].id).toBe('1');

  act(() => {
    result.current.setSearchTerm('점심 식사');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].id).toBe('2');

  act(() => {
    result.current.setSearchTerm('아차산');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].id).toBe('4');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: weekResult } = renderHook(() => useSearch(EVENTS, CURRENT_DATE, 'week'));
  act(() => {
    weekResult.current.setSearchTerm('');
  });
  expect(weekResult.current.filteredEvents.map((e) => e.id).sort()).toEqual(['1', '2', '3']);
  expect(weekResult.current.filteredEvents.some((e) => e.id === '4')).toBe(false);

  const { result: monthResult } = renderHook(() => useSearch(EVENTS, CURRENT_DATE, 'month'));
  act(() => {
    monthResult.current.setSearchTerm('');
  });
  expect(monthResult.current.filteredEvents.map((e) => e.id).sort()).toEqual(['1', '2', '3']);
  expect(monthResult.current.filteredEvents.some((e) => e.id === '4')).toBe(false);

  const NEXT_MONTH = new Date(2025, 5, 1);
  const { result: nextMonthResult } = renderHook(() => useSearch(EVENTS, NEXT_MONTH, 'month'));
  act(() => {
    nextMonthResult.current.setSearchTerm('');
  });
  expect(nextMonthResult.current.filteredEvents).toHaveLength(2);
  expect(nextMonthResult.current.filteredEvents[0].id).toBe('4');
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(EVENTS, CURRENT_DATE, 'week'));

  expect(result.current.filteredEvents.map((e) => e.id).sort()).toEqual(['1', '2', '3']);

  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.searchTerm).toBe('회의');
  expect(result.current.filteredEvents.map((e) => e.id).sort()).toEqual([]);

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.searchTerm).toBe('점심');
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].id).toBe('2');

  act(() => {
    result.current.setSearchTerm('');
  });
  expect(result.current.searchTerm).toBe('');
  expect(result.current.filteredEvents.map((e) => e.id).sort()).toEqual(['1', '2', '3']);
});
