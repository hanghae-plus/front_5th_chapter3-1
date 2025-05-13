import {act, renderHook} from '@testing-library/react';

import {useSearch} from '../../hooks/useSearch.ts';
import {Event} from '../../types.ts';

const event1: Event = {
  "id": "1",
  "title": "event1",
  "date": "2025-07-02",
  "startTime": "09:00",
  "endTime": "12:00",
  "description": "이벤트 1",
  "location": "회의실 A",
  "category": "업무",
  "repeat": {"type": "none", "interval": 0},
  "notificationTime": 10
}
const event2: Event = {
  "id": "2",
  "title": "event2",
  "date": "2025-07-15",
  "startTime": "14:00",
  "endTime": "16:00",
  "description": "이벤트 2",
  "location": "회의실 B",
  "category": "업무",
  "repeat": {"type": "none", "interval": 0},
  "notificationTime": 10
}
const event3: Event = {
  "id": "2",
  "title": "event3",
  "date": "2025-07-31",
  "startTime": "14:00",
  "endTime": "16:00",
  "description": "이벤트 3",
  "location": "회의실 C",
  "category": "업무",
  "repeat": {"type": "none", "interval": 0},
  "notificationTime": 10
}

const events = [event1, event2, event3]

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const {result} = renderHook(() => useSearch(events, new Date('2025-07-17'), 'month'));
  expect(result.current.filteredEvents).toEqual(events)
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const {result} = renderHook(() => useSearch(events, new Date('2025-07-17'), 'month'));
  act(() => {
    result.current.setSearchTerm('event3')
  })
  expect(result.current.filteredEvents).toEqual([event3])
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const {result} = renderHook(() => useSearch(events, new Date('2025-07-17'), 'month'));
  act(() => {
    result.current.setSearchTerm('event1')
  })
  expect(result.current.filteredEvents).toEqual([event1])

  act(() => {
    result.current.setSearchTerm('이벤트 2')
  })
  expect(result.current.filteredEvents).toEqual([event2])

  act(() => {
    result.current.setSearchTerm('회의실')
  })
  expect(result.current.filteredEvents).toEqual(events)
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const {result} = renderHook(() => useSearch(events, new Date('2025-07-17'), 'week'));
  act(() => {
    result.current.setSearchTerm('event')
  })
  expect(result.current.filteredEvents).toEqual([event2])
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const {result} = renderHook(() => useSearch(events, new Date('2025-07-17'), 'month'));
  act(() => {
    result.current.setSearchTerm('회의')
  })
  expect(result.current.filteredEvents).toEqual(events)

  act(() => {
    result.current.setSearchTerm('점심')
  })
  expect(result.current.filteredEvents).toEqual([])
});
