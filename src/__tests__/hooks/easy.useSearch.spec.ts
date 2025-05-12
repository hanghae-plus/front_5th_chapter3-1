import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    id: '7a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p',
    title: '이벤트 2',
    date: '2025-07-02',
    startTime: '09:00',
    endTime: '18:00',
    description: '제주도 여행',
    location: '제주도',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
  {
    id: '9b8c7d6e-5f4g-3h2i-1j0k-9l8m7n6o5p4',
    title: 'Test Title',
    date: '2025-07-01',
    startTime: '14:00',
    endTime: '16:00',
    description: '상반기 성과 회고 및 하반기 계획',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6',
    title: '가족 모임',
    date: '2025-07-31',
    startTime: '12:00',
    endTime: '15:00',
    description: '가족 모임 및 점심 식사',
    location: '가족 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7',
    title: '신입사원 교육',
    date: '2025-07-10',
    startTime: '10:00',
    endTime: '17:00',
    description: '신입사원 온보딩 교육',
    location: '교육장',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
];

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-07-01'));
});

afterAll(() => {
  vi.useRealTimers();
});

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));
  expect(result.current.filteredEvents.length).toEqual(events.length);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('교육');
  });

  expect(result.current.filteredEvents.length).toBe(1);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

  // 제목
  act(() => {
    result.current.setSearchTerm('Test');
  });

  expect(result.current.filteredEvents.length).toBe(1);

  // 설명
  act(() => {
    result.current.setSearchTerm('회고');
  });

  expect(result.current.filteredEvents.length).toBe(1);

  // 위치
  act(() => {
    result.current.setSearchTerm('B');
  });

  expect(result.current.filteredEvents.length).toBe(1);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: weekResult } = renderHook(() => useSearch(events, new Date(), 'week'));

  expect(weekResult.current.filteredEvents.length).toBe(2);

  const { result: monthResult } = renderHook(() => useSearch(events, new Date(), 'month'));

  expect(monthResult.current.filteredEvents.length).toBe(4);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents[0].title).toBe('Test Title');

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents[0].title).toBe('가족 모임');
});
