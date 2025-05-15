import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { getWeekDates } from '../../utils/dateUtils.ts';
import { makeEvents } from '../utils/event.ts';

const TODAY = new Date();
const TITLE = '내가 만든 제목';
const DESCRIPTION = '내가 만든 설명';
const LOCATION = '내가 만든 위치';

const events = makeEvents(10).map((event, index) => ({
  ...event,
  title: `${TITLE} - ${index}`,
  description: `${DESCRIPTION} - ${index}`,
  location: `${LOCATION} - ${index}`,
  date: TODAY.toISOString().split('T')[0],
}));

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, TODAY, 'month'));

  expect(result.current.filteredEvents).toStrictEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, TODAY, 'month'));
  act(() => result.current.setSearchTerm(`${TITLE} - 1`));

  const filteredEvents = events.filter((event) => event.title.includes(`${TITLE} - 1`));

  expect(result.current.filteredEvents).toStrictEqual(filteredEvents);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const titleFilteredEvents = events.filter((event) => event.title.includes(`${TITLE} - 1`));
  const descriptionFilteredEvents = events.filter((event) =>
    event.description.includes(`${DESCRIPTION} - 1`)
  );
  const locationFilteredEvents = events.filter((event) =>
    event.location.includes(`${LOCATION} - 1`)
  );

  const { result } = renderHook(() => useSearch(events, TODAY, 'month'));

  // 제목 검색
  act(() => result.current.setSearchTerm(`${TITLE} - 1`));
  expect(result.current.filteredEvents).toStrictEqual(titleFilteredEvents);

  // 설명 검색
  act(() => result.current.setSearchTerm(`${DESCRIPTION} - 1`));
  expect(result.current.filteredEvents).toStrictEqual(descriptionFilteredEvents);

  // 위치 검색
  act(() => result.current.setSearchTerm(`${LOCATION} - 1`));
  expect(result.current.filteredEvents).toStrictEqual(locationFilteredEvents);
});

it('🐬 현재 뷰(주간)에 해당하는 이벤트만 반환해야 한다', () => {
  const date = new Date('2025-10-9');
  const events = [
    ...makeEvents(10).map((event, index) => ({
      ...event,
      title: `${TITLE} - ${index}`,
      date: new Date(`2025-10-${index + 1}`).toISOString().split('T')[0],
    })),
    ...makeEvents(10).map((event, index) => ({
      ...event,
      title: `${TITLE} - ${index}`,
      date: new Date(`2025-11-${index + 1}`).toISOString().split('T')[0],
    })),
  ];

  const { result } = renderHook(() => useSearch(events, date, 'month'));

  // 월간 검색
  act(() => result.current.setSearchTerm(`${TITLE} - 1`));
  expect(result.current.filteredEvents).toStrictEqual(
    events.filter((event) => event.date.includes('2025-10') && event.title.includes(`${TITLE} - 1`))
  );
});

it('🐬 현재 뷰(월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const date = new Date('2025-10-9');
  const events = makeEvents(20).map((event, index) => ({
    ...event,
    title: `${TITLE} - ${index}`,
    date: new Date(`2025-10-${index + 1}`).toISOString().split('T')[0],
  }));

  const { result } = renderHook(() => useSearch(events, date, 'week'));

  const weekDates = getWeekDates(date).map((date) => date.toISOString().split('T')[0]);

  const filteredEvents = events.filter(
    (event) => weekDates.includes(event.date) && event.title.includes(`${TITLE} - 1`)
  );

  // 월간 검색
  act(() => result.current.setSearchTerm(`${TITLE} - 1`));
  expect(result.current.filteredEvents).toStrictEqual(filteredEvents);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const events = makeEvents(10).map((event, index) => ({
    ...event,
    title: index % 2 === 0 ? '회의' : '점심',
  }));

  const { result } = renderHook(() => useSearch(events, TODAY, 'month'));
  const 회의Events = events.filter((event) => event.title.includes('회의'));
  const 점심Events = events.filter((event) => event.title.includes('점심'));

  act(() => result.current.setSearchTerm('회의'));
  expect(result.current.filteredEvents).toStrictEqual(회의Events);

  act(() => result.current.setSearchTerm('점심'));
  expect(result.current.filteredEvents).toStrictEqual(점심Events);
});
