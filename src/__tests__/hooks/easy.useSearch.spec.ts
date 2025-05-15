import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../shared/hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    id: '1',
    title: '팀 회의', // ✅ '회의' 포함되어 있어야 함
    date: '2025-07-01', // ✅ currentDate와 같은 달
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 정기 회의',
    location: '서울',
    notificationTime: 0,
    repeat: undefined,
    category: '',
  },
  {
    id: '2',
    date: '2025-07-01',
    startTime: '12:00',
    endTime: '13:00',
    title: '점심 식사',
    description: '외부 미팅',
    location: '부산',
    category: '',
    repeat: undefined,
    notificationTime: 0,
  },
  {
    id: '3',
    date: '2025-08-01',
    startTime: '14:00',
    endTime: '15:00',
    title: '워크숍',
    description: '연례 행사',
    location: '제주',
    category: '',
    repeat: undefined,
    notificationTime: 0,
  },
];

const currentDate = new Date('2025-07-01');

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  // 	events는 총 3개지만 currentDate는 '2025-07-01'이고 view는 'month'이므로
  // → 7월에 속한 이벤트(id: '1', '2')만 필터 기준에 해당합니다.
  const { result } = renderHook(() => useSearch(events, currentDate, 'month'));
  act(() => {
    result.current.setSearchTerm('');
  });
  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2']);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1']);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('부산');
  });

  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['2']);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, currentDate, 'week'));

  // 주간 뷰에서는 7월 1일만 포함됨 → id: '1', '2'
  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2']);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1']);

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['2']);
});
