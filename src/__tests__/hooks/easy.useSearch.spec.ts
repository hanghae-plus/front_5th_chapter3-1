import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    category: '업무',
    date: '2025-05-20',
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '팀 회의',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A"',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    category: '개인',
    date: '2025-05-20',
    id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
    title: '팀 회의',
    startTime: '11:00',
    endTime: '12:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당"',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    category: '개인',
    date: '2025-05-30',
    id: '09702fb3-a478-40b3-905e-9ab3c8849dcdf',
    title: '팀 회의 하다가 인사하기',
    startTime: '12:30',
    endTime: '13:30',
    description: '지나가면서 신규에게 인사하기',
    location: '회사',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    category: '개인',
    date: '2025-07-30',
    id: '09702fb3-a478-40b3-905e-9ab3c8849dcdf',
    title: '게임하러 가기',
    startTime: '12:30',
    endTime: '13:30',
    description: '게임',
    location: '피시방',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];

it('searchTerm의 초기값은 빈값이어야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-20'), 'month'));
  expect(result.current.searchTerm).toBe('');
});

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-20'), 'month'));
  expect(result.current.filteredEvents).toHaveLength(3);
});

//"검색어에 맞는 이벤트만 필터링해야 한다" 라는 테스트를 이 테스트가 포함한다고 판단 -> "검색어에 맞는 이벤트만 필터링해야 한다" 삭제
it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-20'), 'month'));
  //제목에 포함된 단어로 검색
  act(() => {
    result.current.setSearchTerm('인사하기');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('팀 회의 하다가 인사하기');

  // 설명에 포함된 단어로 검색
  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].description).toContain('점심');

  // 위치에 포함된 단어로 검색
  act(() => {
    result.current.setSearchTerm('식당');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].location).toContain('식당');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: resultMonth } = renderHook(() =>
    useSearch(events, new Date('2025-05-20'), 'month')
  );
  expect(resultMonth.current.filteredEvents).toHaveLength(3);

  const { result: resultWeek } = renderHook(() =>
    useSearch(events, new Date('2025-05-20'), 'week')
  );
  expect(resultWeek.current.filteredEvents).toHaveLength(2);
});

it("검색어를 '회의'에서 '인사'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-20'), 'month'));
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toHaveLength(3);

  act(() => {
    result.current.setSearchTerm('인사');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
});
