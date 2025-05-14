import { act, renderHook } from '@testing-library/react';

import eventJson from '../../__mocks__/response/mockEvent.json';
import { useSearch } from '../../hooks/useSearch';
import { Event } from '../../types';

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-07-01'));
});

afterAll(() => {
  vi.useRealTimers();
});

const event = eventJson.events as Event[];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(event, new Date(), 'month'));

  expect(result.current.filteredEvents).toHaveLength(3);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(event, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('카페');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].location).toBe('카페');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(event, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('월말');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].id).toBe('4');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(event, new Date(), 'week'));

  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2', '3']);
});

it("검색어를 '회의'에서 '카페'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(event, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('회의'); // '이벤트 1'
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].id).toBe('1');

  act(() => {
    result.current.setSearchTerm('카페'); // '이벤트 2'
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].id).toBe('2');
});
