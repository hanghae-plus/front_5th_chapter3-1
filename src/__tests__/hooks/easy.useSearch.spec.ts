import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

// 테스트용 이벤트
const mockEvents: Event[] = [
  {
    id: '1',
    title: '기존 회의1',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '테스트',
    date: '2025-10-15',
    startTime: '10:00',
    endTime: '11:00',
    description: 'A 팀 미팅',
    location: '회의실 C',
    category: '개발회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '기존 회의3',
    date: '2025-10-15',
    startTime: '12:00',
    endTime: '13:00',
    description: '외부 미팅',
    location: '회의실 D',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

it('검색어가 비어있을 때 월간 뷰에 해당되는 모든 이벤트를 반환해야 한다', () => {
  const currentDate = new Date('2025-10-15');
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));
  expect(result.current.searchTerm).toBe('');
  expect(result.current.filteredEvents.length).toBe(3);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const currentDate = new Date('2025-10-15');
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));
  act(() => {
    result.current.setSearchTerm('테스트');
  });
  expect(result.current.filteredEvents.length).toBe(1);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const currentDate = new Date('2025-10-15');
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  // 제목에 있는 경우
  act(() => {
    result.current.setSearchTerm('회의1');
  });
  expect(result.current.filteredEvents.length).toBe(1);
  expect(result.current.filteredEvents[0].id).toBe('1');

  // 설명에 있는 경우
  act(() => {
    result.current.setSearchTerm('외부');
  });
  expect(result.current.filteredEvents.length).toBe(1);
  expect(result.current.filteredEvents[0].id).toBe('3');

  // 위치에 있는 경우
  act(() => {
    result.current.setSearchTerm('C');
  });
  expect(result.current.filteredEvents.length).toBe(1);
  expect(result.current.filteredEvents[0].id).toBe('2');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  // 월간 뷰인 경우
  const { result: monthResult } = renderHook(() =>
    useSearch(mockEvents, new Date('2025-10-01'), 'month')
  );
  // 모든 이벤트가 보여야 함
  expect(monthResult.current.filteredEvents.length).toBe(3);

  // 주간 뷰인 경우
  const { result: weekResult } = renderHook(() =>
    useSearch(mockEvents, new Date('2025-10-01'), 'week')
  );
  // 모든 이벤트가 안보여야 함
  expect(weekResult.current.filteredEvents.length).toBe(0);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const currentDate = new Date('2025-10-01');
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents.length).toBe(3);

  // 점심으로 변경
  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents.length).toBe(0);
});
