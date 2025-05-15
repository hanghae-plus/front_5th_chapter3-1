import { getWeekDates, isDateInRange } from './dateUtils';
import { Event } from '../../types';

/**
 * 지정된 날짜 범위(start ~ end)에 포함된 이벤트만 필터링합니다.
 * @param events
 * @param start
 * @param end
 * @returns
 */
function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

/**
 * 대상 문자열(target)이 검색어(term)를 포함하는지 여부를 반환합니다.
 * 대소문자를 구분하지 않습니다.
 *
 * @param target
 * @param term
 * @returns
 */
function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

/**
 * 이벤트 배열에서 제목, 설명, 위치에 검색어가 포함된 이벤트만 필터링합니다.
 * @param events
 * @param term
 * @returns
 */
function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

/**
 * 주간 단위로 현재 날짜가 포함된 주의 이벤트만 필터링합니다.
 *
 * @param events
 * @param currentDate
 * @returns
 */
function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

/**
 * 월간 단위로 현재 날짜가 포함된 월의 이벤트만 필터링합니다.
 *
 * @param events
 * @param currentDate
 * @returns
 */
function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  return filterEventsByDateRange(events, monthStart, monthEnd);
}

/**
 * 검색어와 뷰 타입(week 또는 month)에 따라 필터링된 이벤트 목록을 반환합니다.
 *
 * @param events
 * @param searchTerm
 * @param currentDate
 * @param view
 * @returns
 */
export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}
