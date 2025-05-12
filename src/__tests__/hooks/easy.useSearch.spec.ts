import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event, RepeatType } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';

function makeEvent(id: string, updatedProperty: Partial<Event> = {}): Event {
  const defaultEvent = {
    id: id,
    title: `이벤트 ${id}`,
    date: formatDate(new Date()),
    startTime: '10:00',
    endTime: '11:00',
    description: `이벤트 ${id} 설명`,
    location: `이벤트 ${id} 장소`,
    category: `이벤트 ${id} 카테고리`,
    repeat: {
      type: 'none' as RepeatType,
      interval: 0,
    },
    notificationTime: 0,
  };
  return { ...defaultEvent, ...updatedProperty };
}
it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const allEvents = [makeEvent('1'), makeEvent('2')];
  const { result } = renderHook(() => useSearch(allEvents, new Date(), 'week'));
  expect(result.current.filteredEvents).toEqual(allEvents);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const event1 = makeEvent('1');
  const event2 = makeEvent('2');
  const { result } = renderHook(() => useSearch([event1, event2], new Date(), 'week'));
  act(() => {
    result.current.setSearchTerm('1');
  });
  expect(result.current.filteredEvents).toEqual([event1]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const matchedWithTitle = makeEvent('1', { title: '이벤트 1' });
  const matchedWithDescription = makeEvent('2', { description: '이벤트 2' });
  const matchedWithLocation = makeEvent('3', { location: '이벤트 3' });
  const { result } = renderHook(() =>
    useSearch([matchedWithTitle, matchedWithDescription, matchedWithLocation], new Date(), 'week')
  );
  act(() => {
    result.current.setSearchTerm('이벤트');
  });
  expect(result.current.filteredEvents).toEqual([
    matchedWithTitle,
    matchedWithDescription,
    matchedWithLocation,
  ]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const event1 = makeEvent('1', { date: formatDate(new Date('2025-05-01')) });
  const event2 = makeEvent('1', { date: formatDate(new Date('2025-05-14')) });
  const event3 = makeEvent('2', { date: formatDate(new Date('2025-06-02')) });

  const events = [event1, event2, event3];
  const { result } = renderHook(() => useSearch(events, new Date('2025-05-01'), 'week'));
  expect(result.current.filteredEvents).toEqual([event1]);

  //월간
  const { result: result2 } = renderHook(() => useSearch(events, new Date('2025-05-01'), 'month'));
  expect(result2.current.filteredEvents).toEqual([event1, event2]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const meeting = makeEvent('1', { title: '회의' });
  const lunch = makeEvent('2', { title: '점심' });
  const { result } = renderHook(() => useSearch([meeting, lunch], new Date(), 'week'));
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([meeting]);

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toEqual([lunch]);
});
