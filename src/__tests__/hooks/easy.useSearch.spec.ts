import { act, renderHook } from '@testing-library/react';

import { Event } from '@/entities/event/model/types';
import { useSearch } from '@/entities/event/model/useSearch';

const events: Event[] = [
  {
    id: '1',
    title: '보고서 마감',
    date: '2025-5-12',
    startTime: '09:00',
    endTime: '10:00',
    description: '회의',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '2',
    title: '이벤트 신청',
    date: '2025-05-15',
    startTime: '11:00',
    endTime: '11:30',
    description: '놓치면 1초만에 마감됨.',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  },
  {
    id: '3',
    title: '수강 신청',
    date: '2025-05-18',
    startTime: '09:00',
    endTime: '10:00',
    description: '점심 먹고 바로 드간다',
    location: 'PC방',
    category: '학교',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-12'), 'month'));
  expect(result.current.searchTerm).toBe('');
  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-12'), 'month'));
  act(() => {
    result.current.setSearchTerm('이벤트');
  });
  expect(result.current.filteredEvents).toEqual([events[1]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-12'), 'month'));
  act(() => {
    result.current.setSearchTerm('마감');
  });
  expect(result.current.filteredEvents).toEqual([events[0], events[1]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-12'), 'month'));
  expect(result.current.filteredEvents).toEqual([events[0], events[1], events[2]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-12'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([events[0]]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([events[2]]);
});
