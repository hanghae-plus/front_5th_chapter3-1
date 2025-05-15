import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '주간 회의',
    date: '2023-10-10',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 식사',
    date: '2023-10-10',
    startTime: '12:00',
    endTime: '13:00',
    description: '팀 점심 식사',
    location: '구내식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  },
  {
    id: '3',
    title: '월간 보고서 미팅',
    date: '2023-10-15',
    startTime: '14:00',
    endTime: '15:00',
    description: '월간 성과 보고',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  },
  {
    id: '4',
    title: '생일 파티',
    date: '2023-10-20',
    startTime: '18:00',
    endTime: '21:00',
    description: '김철수 생일 축하',
    location: '레스토랑',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
];

// 테스트에 사용할 현재 날짜 (2023-10-10)
const currentDate = new Date(2023, 9, 10);

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'week'));

  expect(result.current.searchTerm).toBe('');

  // 현재 주에 해당하는 이벤트만 반환해야 함 (10/8-10/14)
  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents[0].id).toBe('1');
  expect(result.current.filteredEvents[1].id).toBe('2');
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  // 초기 상태 확인 (10월에 해당하는 모든 이벤트)
  expect(result.current.filteredEvents).toHaveLength(4);

  // "회의"로 검색
  act(() => {
    result.current.setSearchTerm('회의');
  });

  // "회의"가 포함된 이벤트만 필터링
  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents[0].title).toBe('주간 회의');
  expect(result.current.filteredEvents[1].title).toBe('월간 보고서 미팅');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  // "팀"으로 검색 (제목과 설명에 포함됨)
  act(() => {
    result.current.setSearchTerm('팀');
  });

  // "팀"이 포함된 이벤트 필터링
  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents[0].id).toBe('1');
  expect(result.current.filteredEvents[1].id).toBe('2');

  // "회의실"로 검색 (위치에 포함됨)
  act(() => {
    result.current.setSearchTerm('회의실');
  });

  // "회의실"이 포함된 이벤트 필터링
  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents[0].id).toBe('1');
  expect(result.current.filteredEvents[1].id).toBe('3');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  // 주간 뷰 테스트
  const { result: weekResult } = renderHook(() => useSearch(mockEvents, currentDate, 'week'));

  // 10/8-10/14 주에 해당하는 이벤트만 반환
  expect(weekResult.current.filteredEvents).toHaveLength(2);
  expect(weekResult.current.filteredEvents[0].id).toBe('1');
  expect(weekResult.current.filteredEvents[1].id).toBe('2');

  // 월간 뷰 테스트
  const { result: monthResult } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  // 10월에 해당하는 모든 이벤트 반환
  expect(monthResult.current.filteredEvents).toHaveLength(4);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  // "회의"로 검색
  act(() => {
    result.current.setSearchTerm('회의');
  });

  // "회의"가 포함된 이벤트만 필터링
  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents[0].title).toBe('주간 회의');

  // "점심"으로 검색어 변경
  act(() => {
    result.current.setSearchTerm('점심');
  });

  // "점심"이 포함된 이벤트만 필터링
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 식사');
});
