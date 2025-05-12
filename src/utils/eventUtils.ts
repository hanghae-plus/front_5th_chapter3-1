import { Event } from '../types';
import { getWeekDates, isDateInRange } from './dateUtils';

/**
 * 날짜 범위에 따른 이벤트 필터링
 * @param events - 이벤트 목록
 * @param start - 시작 날짜
 * @param end - 종료 날짜
 * @returns 날짜 범위에 따른 필터링된 이벤트 목록
 */
function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

/**
 * 문자열 검색
 * @param target - 검색 대상 문자열
 * @param term - 검색 키워드
 * @returns 검색 대상 문자열에 검색 키워드가 포함되어 있는지 여부
 */
function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

/**
 * 이벤트 검색
 * @param events - 이벤트 목록
 * @param term - 검색 키워드
 * @returns 검색된 이벤트 목록
 */
function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

/**
 * 주간 뷰에서 이벤트 필터링
 * @param events - 이벤트 목록
 * @param currentDate - 현재 날짜
 * @returns 주간 뷰에서 필터링된 이벤트 목록
 */
function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

/**
 * 월간 뷰에서 이벤트 필터링
 * @param events - 이벤트 목록
 * @param currentDate - 현재 날짜
 * @returns 월간 뷰에서 필터링된 이벤트 목록
 */
function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
  return filterEventsByDateRange(events, monthStart, monthEnd);
}

/**
 * 이벤트 검색 및 필터링
 * @param events - 이벤트 목록
 * @param searchTerm - 검색 키워드
 * @param currentDate - 현재 날짜
 * @param view - 뷰 타입 ('week' | 'month')
 * @returns 필터링된 이벤트 목록
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
