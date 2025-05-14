import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const sampleEvents: Event[] = [
  {
    id: '1',
    title: '이벤트1',
    description: '이벤트1 설명',
    location: '이벤트1 위치',
    date: '2024-10-01',
    startTime: '10:00',
    endTime: '11:00',
    category: 'event',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
  {
    id: '2',
    title: '이벤트2',
    description: '이벤트2 설명',
    location: '이벤트2 점심 위치',
    date: '2024-10-02',
    startTime: '10:00',
    endTime: '11:00',
    category: 'event',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(sampleEvents, new Date('2024-10-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('');
  });
  expect(result.current.filteredEvents).toEqual(sampleEvents);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(sampleEvents, new Date('2024-10-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('이벤트1');
  });
  expect(result.current.filteredEvents).toEqual([sampleEvents[0]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(sampleEvents, new Date('2024-10-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('이벤트');
  });
  expect(result.current.filteredEvents).toEqual([sampleEvents[0], sampleEvents[1]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: weekRslt } = renderHook(() =>
    useSearch(sampleEvents, new Date('2024-10-02'), 'week')
  );
  act(() => {
    weekRslt.current.setSearchTerm('이벤트');
  });
  expect(weekRslt.current.filteredEvents).toEqual([sampleEvents[0], sampleEvents[1]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useSearch(sampleEvents, new Date('2024-10-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([]);

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toEqual([sampleEvents[1]]);
});
