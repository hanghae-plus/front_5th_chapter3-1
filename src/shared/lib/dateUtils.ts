import { Event } from '../../types.ts';

/**
 * 주어진 년도와 월의 일수를 반환합니다.
 */
export function getDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 0;
  return new Date(year, month, 0).getDate();
}

/**
 * 주어진 날짜가 속한 주의 모든 날짜를 반환합니다.
 * @param date
 * @returns
 */
export function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date.setDate(diff));
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(sunday);
    nextDate.setDate(sunday.getDate() + i);
    weekDates.push(nextDate);
  }
  return weekDates;
}

function createWeekArray(): Array<number | null> {
  return Array(7).fill(null);
}
function calculateWeekIndex(firstDayOfMonth: number, day: number) {
  return (firstDayOfMonth + day - 1) % 7;
}

/**
 * 주어진 날짜가 속한 월의 모든 주의 날짜를 반환합니다.
 * @param currentDate
 * @returns
 */
export function getWeeksAtMonth(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const weeks: Array<Array<number | null>> = [];

  let week = createWeekArray(); // ✅ 호출 시마다 새 배열 생성

  for (let i = 0; i < firstDayOfMonth; i++) {
    week[i] = null;
  }

  for (const day of days) {
    const dayIndex = calculateWeekIndex(firstDayOfMonth, day);
    week[dayIndex] = day;
    if (dayIndex === 6 || day === daysInMonth) {
      weeks.push(week);
      week = createWeekArray(); // ❗️새로운 배열을 만들어야 함
    }
  }

  return weeks;
}

/**
 * events 배열 중에서, date(예: 5일)에 해당하는 이벤트만 골라서 반환한다.
 * @param events
 * @param date
 * @returns
 */
export function getEventsForDay(events: Event[], date: number): Event[] {
  return events.filter((event) => {
    if (!isValidDateString(event.date)) return false;
    return new Date(event.date).getDate() === date;
  });
}

/**
 * 정귝식 전환 체크 ISO 형식만 허용 (YYYY-MM-DD)
 * @param str
 * @returns
 */
function isValidDateString(str: string): boolean {
  // 1. 정규식으로 형식 체크
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;

  // 2. 날짜로 파싱해서 유효한지 확인
  const date = new Date(str);
  return !isNaN(date.getTime()) && str === date.toISOString().slice(0, 10);
}

/**
 * 월정보 반환
 * @param targetDate
 * @returns
 */
export function formatWeek(targetDate: Date): string {
  const dayOfWeek = targetDate.getDay();
  const diffToThursday = 4 - dayOfWeek;
  const thursday = new Date(targetDate);
  thursday.setDate(targetDate.getDate() + diffToThursday);

  const year = thursday.getFullYear();
  const month = thursday.getMonth() + 1;

  const firstDayOfMonth = new Date(thursday.getFullYear(), thursday.getMonth(), 1);

  const firstThursday = new Date(firstDayOfMonth);
  firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));

  const weekNumber: number =
    Math.floor((thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  return `${year}년 ${month}월 ${weekNumber}주`;
}

/**
 * 주어진 날짜의 월 정보를 "YYYY년 M월" 형식으로 반환합니다.
 */
export function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
}

/**
 * 주어진 날짜가 특정 범위 내에 있는지 확인합니다.
 */
export function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
  return date >= rangeStart && date <= rangeEnd;
}

/**
 * 한자리 숫자앞에 0을 붙힙니다.
 * @param value
 * @param size
 * @returns
 */
export function fillZero(value: number, size = 2) {
  return String(value).padStart(size, '0');
}

/**
 * 날짜 포맷팅
 * @param currentDate
 * @param day
 * @returns
 */
export function formatDate(currentDate: Date, day?: number) {
  return [
    currentDate.getFullYear(),
    fillZero(currentDate.getMonth() + 1),
    fillZero(day ?? currentDate.getDate()),
  ].join('-');
}
