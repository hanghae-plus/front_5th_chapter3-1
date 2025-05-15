import { Event } from '../types.ts';

/**
 * 주어진 년도와 월의 일수를 반환합니다.
 *
 * @throws 유효하지 않은 월에 대해서는 -1을 반환합니다.
 * @example
 * getDaysInMonth(2024, 2) // 29
 * getDaysInMonth(2024, 14) // -1
 */
export const getDaysInMonth = (year: number, month: number) => {
  if (month < 1 || month > 12) {
    return -1;
  }

  return new Date(year, month, 0).getDate();
};

/**
 * 주어진 날짜가 속한 주의 모든 날짜를 반환합니다.
 * ( 달력이라서 일요일을 한주의 시작으로 계산 )
 *
 * @example
 * getWeekDates(new Date('2024-01-01'))
 * // [2023-12-31, 2024-01-01, 2024-01-02, 2024-01-03, 2024-01-04, 2024-01-05, 2024-01-06]
 */
export const getWeekDates = (date: Date) => {
  const copyDate = new Date(date);

  // 일요일을 한주의 시작으로 계산되기 때문에 특수 처리 ( 7로 변환 )
  const day = copyDate.getDay();
  const diff = copyDate.getDate() - day;
  const sunday = new Date(copyDate.setDate(diff));

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const nextDate = new Date(sunday);
    nextDate.setDate(sunday.getDate() + i);
    return nextDate;
  });

  return weekDates;
};

/**
 * 주어진 날짜가 속한 월의 모든 주의 날짜를 반환합니다.
 * ( 이전/이후 월의 날짜는 모두 null로 처리 )
 *
 * @example
 * getWeeksAtMonth(new Date('2025-07-01'))
 * [
 *  [ null, null, 1, 2, 3, 4, 5 ],
 *  [ 6, 7, 8, 9, 10, 11, 12 ],
 *  [ 13, 14, 15, 16, 17, 18, 19 ],
 *  [ 20, 21, 22, 23, 24, 25, 26 ],
 *  [ 27, 28, 29, 30, 31, null, null ]
 * ]
 */
export const getWeeksAtMonth = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = [];

  const getInitialWeek = () => Array(7).fill(null);

  let week: Array<number | null> = getInitialWeek();

  for (let i = 0; i < firstDayOfMonth; i++) {
    week[i] = null;
  }

  for (const day of days) {
    const dayIndex = (firstDayOfMonth + day - 1) % 7;
    week[dayIndex] = day;
    if (dayIndex === 6 || day === daysInMonth) {
      weeks.push(week);
      week = getInitialWeek();
    }
  }

  return weeks;
};

/**
 * 주어진 날짜에 해당하는 이벤트를 반환합니다.
 *
 * @example
 * getEventsForDay(events, 1)
 * [
 *  {
 *    id: '1',
 *    title: '1-내가 만든 제목',
 *    description: '1-내가 만든 설명',
 *    date: '2025-07-01',
 *    startTime: '00:00',
 *    endTime: '01:00',
 *    location: '1-내가 만든 위치',
 *    category: '업무',
 *    notificationTime: 10,
 *    repeat: { type: 'none', interval: 1, endDate: '1-2025-05-14' }
 *  }
 *  // ...
 * ]
 */
export const getEventsForDay = (events: Event[], date: number) => {
  return events.filter((event) => new Date(event.date).getDate() === date);
};

/**
 * 주어진 날짜의 주 정보를 "YYYY년 M월 W주" 형식으로 반환합니다.
 * ( 한주에 여러 달이 겹치는 경우 "목요일" 기준으로 결정 (더 많은 일이 포함된 달의 주 정보를 반환) )
 *
 * @example
 * formatWeek(new Date('2025-07-01')) // '2025년 7월 1주'
 * formatWeek(new Date('2025-07-08')) // '2025년 7월 2주'
 * formatWeek(new Date('2025-07-15')) // '2025년 7월 3주'
 * formatWeek(new Date('2025-07-22')) // '2025년 7월 4주'
 * formatWeek(new Date('2025-07-28')) // (월) '2025년 8월 1주'
 * formatWeek(new Date('2024-08-01')) // (목) '2024년 8월 1주'
 */
export const formatWeek = (targetDate: Date) => {
  const dayOfWeek = targetDate.getDay();
  const diffToThursday = 4 - dayOfWeek;
  const thursday = new Date(targetDate);
  thursday.setDate(targetDate.getDate() + diffToThursday);

  const year = thursday.getFullYear();
  const month = thursday.getMonth() + 1;

  const firstDayOfMonth = new Date(thursday.getFullYear(), thursday.getMonth(), 1);

  const firstThursday = new Date(firstDayOfMonth);
  firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));

  const weekNumber =
    Math.floor((thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  return `${year}년 ${month}월 ${weekNumber}주`;
};

/**
 * 주어진 날짜의 월 정보를 "YYYY년 M월" 형식으로 반환합니다.
 *
 * @example
 * formatMonth(new Date('2025-07-10')) // '2025년 7월'
 */
export const formatMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
};

/**
 * 주어진 날짜가 특정 범위 내에 있는지 확인합니다.
 *
 * @example
 * const rangeStart = new Date('2025-07-01');
 * const rangeEnd = new Date('2025-07-31');
 *
 * isDateInRange(new Date('2025-07-01'), rangeStart, rangeEnd) // true
 * isDateInRange(new Date('2025-07-31'), rangeStart, rangeEnd) // true
 * isDateInRange(new Date('2025-07-20'), rangeStart, rangeEnd) // false
 * isDateInRange(new Date('2025-07-20'), rangeEnd, rangeStart) // false
 */
export const isDateInRange = (date: Date, rangeStart: Date, rangeEnd: Date) => {
  return date >= rangeStart && date <= rangeEnd;
};

/**
 * 주어진 값을 지정된 자리수로 변환합니다.
 *
 * @example
 * fillZero(5) // '05'
 * fillZero(10) // '10'
 * fillZero(3, 3) // '003'
 * fillZero(100, 2) // '100'
 * fillZero(0, 2) // '00'
 * fillZero(1, 5) // '00001'
 * fillZero(3.14, 5) // '03.14'
 */
export const fillZero = (value: number, size = 2) => {
  return String(value).padStart(size, '0');
};

/**
 * 주어진 날짜를 YYYY-MM-DD 형식으로 포맷팅합니다.
 *
 * @example
 * formatDate(new Date('2025-07-01')) // '2025-07-01'
 * formatDate(new Date('2025-07-01'), 1) // '2025-07-01'
 * formatDate(new Date('2025-07-01'), 1) // '2025-07-01'
 */
export const formatDate = (currentDate: Date, day?: number) => {
  return [
    currentDate.getFullYear(),
    fillZero(currentDate.getMonth() + 1),
    fillZero(day ?? currentDate.getDate()),
  ].join('-');
};
