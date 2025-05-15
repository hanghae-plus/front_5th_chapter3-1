import { act, renderHook } from '@testing-library/react';

import { sampleEvents } from '../../__mocks__/mocksData.ts';
import { useSearch } from '../../features/search/models/useSearch.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(sampleEvents, new Date('2024-03-01'), 'month'));

  expect(result.current.filteredEvents).toHaveLength(5);
  expect(result.current.filteredEvents).toEqual(sampleEvents);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(sampleEvents, new Date('2024-03-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('미팅');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('팀 주간 미팅');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(sampleEvents, new Date('2024-03-01'), 'month'));

  // 제목으로 검색
  act(() => {
    result.current.setSearchTerm('스탠드업');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('일일 스탠드업');

  // 설명으로 검색
  act(() => {
    result.current.setSearchTerm('실적 보고');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('월간 보고');

  // 위치로 검색
  act(() => {
    result.current.setSearchTerm('대회의실');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].location).toBe('대회의실');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  // 월간 뷰 테스트 (3월 전체)
  const { result: monthResult } = renderHook(() =>
    useSearch(sampleEvents, new Date('2024-03-01'), 'month')
  );
  expect(monthResult.current.filteredEvents).toHaveLength(5);

  // 주간 뷰 테스트 (3월 1일이 포함된 주)
  const { result: weekResult } = renderHook(() =>
    useSearch(sampleEvents, new Date('2024-03-01'), 'week')
  );

  const weekEvents = weekResult.current.filteredEvents;
  expect(weekEvents.some((e) => e.date === '2024-03-01')).toBe(true);
  expect(weekEvents.some((e) => e.date === '2024-03-20')).toBe(false);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(sampleEvents, new Date('2024-03-01'), 'month'));

  // '미팅' 검색
  act(() => {
    result.current.setSearchTerm('미팅');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('팀 주간 미팅');

  // '점심'으로 변경
  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 약속');
});
