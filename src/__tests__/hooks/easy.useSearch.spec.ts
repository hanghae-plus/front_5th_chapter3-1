import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    description: '팀 회의',
    location: '서울',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 식사',
    description: '친구와 약속',
    location: '강남',
    date: '2025-07-02',
    startTime: '12:00',
    endTime: '13:00',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '휴가',
    description: '해외 여행',
    location: '부산',
    date: '2025-08-01',
    startTime: '08:00',
    endTime: '18:00',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const currentDate = new Date('2025-07-01');
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  expect(result.current.filteredEvents).toHaveLength(2); // 7월 이벤트만
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const currentDate = new Date('2025-07-01');
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('회의');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const currentDate = new Date('2025-07-01');
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('강남');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].location).toBe('강남');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const currentDate = new Date('2025-07-01');
  const { result } = renderHook(
    () => useSearch(mockEvents, currentDate, 'week') // 7/1 ~ 7/5 범위
  );

  expect(result.current.filteredEvents).toHaveLength(2); // 7/1, 7/2 포함
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const currentDate = new Date('2025-07-01');
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('회의');

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 식사');
});
