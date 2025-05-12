import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';
act;
renderHook;
useSearch;

const common: Event = {
  id: '',
  title: '',
  date: '',
  startTime: '10:00',
  endTime: '11:00',
  description: '',
  location: '',
  category: '',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 0,
} as const;
const events: Event[] = [
  {
    ...common,
    id: '1',
    title: '이벤트 하나', // 제목
    date: '2025-05-01',
    description: '이벤트 1 설명',
    location: '이벤트 회의 장소', // 회의
    category: '이벤트',
  },
  {
    ...common,
    id: '2',
    title: '상황 2',
    date: '2025-05-05',
    description: '점심 상황 2 설명', // 점심
    location: '상황 장소 하나', // 장소
    category: '상황',
  },
  {
    ...common,
    id: '3',
    title: '발생 3',
    date: '2025-05-13',
    description: '발생 3 설명 하나?', // 설명
    location: '발생 장소',
    category: '발생',
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-12'), 'month'));
  expect(result.current.filteredEvents.length).toBe(3);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-12'), 'month'));
  act(() => {
    result.current.setSearchTerm('상황');
  });
  expect(result.current.filteredEvents.length).toBe(1);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-12'), 'month'));
  act(() => {
    result.current.setSearchTerm('하나');
  });
  expect(result.current.filteredEvents.length).toBe(3);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-12'), 'week'));
  expect(result.current.filteredEvents.length).toBe(1);
  expect(result.current.filteredEvents[0].id).toBe('3');
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-12'), 'month'));
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents.length).toBe(1);
  expect(result.current.filteredEvents[0].id).toBe('1');

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents.length).toBe(1);
  expect(result.current.filteredEvents[0].id).toBe('2');
});
