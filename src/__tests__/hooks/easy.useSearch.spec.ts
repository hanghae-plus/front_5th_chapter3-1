import { act, renderHook, waitFor } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    description: '프로젝트 계획 논의',
    location: '회의실 A',
    date: '2025-05-16',
    startTime: '10:00',
    endTime: '11:00',
    category: 'work',
    notificationTime: 10,
    repeat: {
      type: 'none',
      interval: 0,
      endDate: '',
    },
  },
  {
    id: '2',
    title: '점심 식사',
    description: '동료들과 점심',
    location: '식당',
    date: '2025-05-16',
    startTime: '12:00',
    endTime: '13:00',
    category: 'personal',
    notificationTime: 10,
    repeat: {
      type: 'none',
      interval: 0,
      endDate: '',
    },
  },
];

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-05-16'), 'week'));
  expect(result.current.filteredEvents).toEqual(mockEvents);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-05-16'), 'week'));

  act(() => {
    result.current.setSearchTerm('점심 식사');
  });
  expect(result.current.filteredEvents).toEqual([mockEvents[1]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const dateOutOfRange = '2025-06-15';

  const events = [
    ...mockEvents,
    {
      ...mockEvents[0],
      id: '3',
      title: '범위 밖 이벤트',
      date: dateOutOfRange,
    },
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-05-01'), 'month'));

  expect(result.current.filteredEvents.some((e) => e.date === dateOutOfRange)).toBe(false);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-05-16'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });
  await waitFor(() => {
    expect(result.current.filteredEvents).toEqual([mockEvents[0]]);
  });
  act(() => {
    result.current.setSearchTerm('점심');
  });

  await waitFor(() => {
    expect(result.current.filteredEvents).toEqual([mockEvents[1]]);
  });
});
