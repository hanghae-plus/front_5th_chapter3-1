import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';
import { createTestEvent } from '../helpers/event';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2020, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2025, 13)).toBe(31);
    expect(getDaysInMonth(2025, 0)).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const wednesday = new Date('2025-05-14');
    const weekDates = getWeekDates(wednesday);

    expect(weekDates).toHaveLength(7);

    const sunday = weekDates.at(0);
    const saturday = weekDates.at(-1);

    expect(sunday).toEqual(new Date('2025-05-11'));
    expect(saturday).toEqual(new Date('2025-05-17'));
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const monday = new Date('2025-05-12');
    const weekDates = getWeekDates(monday);

    expect(weekDates).toHaveLength(7);

    const sunday = weekDates.at(0);
    const saturday = weekDates.at(-1);

    expect(sunday).toEqual(new Date('2025-05-11'));
    expect(saturday).toEqual(new Date('2025-05-17'));
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sunday = new Date('2025-05-11');
    const weekDates = getWeekDates(sunday);

    expect(weekDates).toHaveLength(7);

    const firstDate = weekDates.at(0);
    const lastDate = weekDates.at(-1);

    expect(firstDate).toEqual(new Date('2025-05-11'));
    expect(lastDate).toEqual(new Date('2025-05-17'));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const lastDayOfYear = new Date('2025-12-31');
    const weekDates = getWeekDates(lastDayOfYear);

    expect(weekDates).toHaveLength(7);

    const sunday = weekDates.at(0);
    const saturday = weekDates.at(-1);

    expect(sunday).toEqual(new Date('2025-12-28'));
    expect(saturday).toEqual(new Date('2026-01-03'));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const firstDayOfYear = new Date('2026-01-01');
    const weekDates = getWeekDates(firstDayOfYear);

    expect(weekDates).toHaveLength(7);

    const sunday = weekDates.at(0);
    const saturday = weekDates.at(-1);

    expect(sunday).toEqual(new Date('2025-12-28'));
    expect(saturday).toEqual(new Date('2026-01-03'));
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const leapDay = new Date('2024-02-29');
    const weekDates = getWeekDates(leapDay);

    expect(weekDates).toHaveLength(7);

    const sunday = weekDates.at(0);
    const saturday = weekDates.at(-1);

    expect(sunday).toEqual(new Date('2024-02-25'));
    expect(saturday).toEqual(new Date('2024-03-02'));
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const lastDayOfMonth = new Date('2025-05-31');
    const weekDates = getWeekDates(lastDayOfMonth);

    expect(weekDates).toHaveLength(7);

    const sunday = weekDates.at(0);
    const saturday = weekDates.at(-1);

    expect(sunday).toEqual(new Date('2025-05-25'));
    expect(saturday).toEqual(new Date('2025-05-31'));
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const firstDayOfMonth = new Date('2025-07-01');
    const weeks = getWeeksAtMonth(firstDayOfMonth);

    expect(weeks).toHaveLength(5);

    const firstWeek = weeks.at(0);
    const lastWeek = weeks.at(-1);

    expect(firstWeek).toEqual([null, null, 1, 2, 3, 4, 5]);
    expect(lastWeek).toEqual([27, 28, 29, 30, 31, null, null]);
  });

  it('윤년의 2월 주간 정보를 올바르게 반환해야 한다', () => {
    const firstDayOfFeb2024 = new Date('2024-02-01');
    const weeks = getWeeksAtMonth(firstDayOfFeb2024);

    const validDays = weeks.flat().filter(Boolean) as number[];

    expect(validDays).toHaveLength(29);
    expect(Math.max(...validDays)).toBe(29);
  });

  it('연말의 올바른 주 정보를 반환한다', () => {
    const lastDayOfYear = new Date('2025-12-31');
    const weeks = getWeeksAtMonth(lastDayOfYear);

    expect(weeks).toHaveLength(5);

    const firstWeek = weeks.at(0);
    const lastWeek = weeks.at(-1);

    expect(firstWeek).toEqual([null, 1, 2, 3, 4, 5, 6]);
    expect(lastWeek).toEqual([28, 29, 30, 31, null, null, null]);
  });
});

describe('getEventsForDay', () => {
  const events: Event[] = [
    createTestEvent({
      id: '1',
      title: '이벤트 1',
      date: '2025-06-01',
      startTime: '09:00',
      endTime: '10:00',
    }),
    createTestEvent({
      id: '2',
      title: '이벤트 2',
      date: '2025-06-15',
      startTime: '14:00',
      endTime: '15:00',
    }),
    createTestEvent({
      id: '3',
      title: '이벤트 3',
      date: '2025-06-01',
      startTime: '16:00',
      endTime: '17:00',
    }),
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const day = 1;
    const eventsForDay = getEventsForDay(events, day);

    expect(eventsForDay).toHaveLength(2);

    expect(eventsForDay).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '1' }),
        expect.objectContaining({ id: '3' }),
      ])
    );
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const day = 2;
    const eventsForDay = getEventsForDay(events, day);

    expect(eventsForDay).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const day = 0;
    const eventsForDay = getEventsForDay(events, day);

    expect(eventsForDay).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const day = 32;
    const eventsForDay = getEventsForDay(events, day);

    expect(eventsForDay).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const middleOfMonth = new Date('2025-05-15');
    const week = formatWeek(middleOfMonth);

    expect(week).toBe('2025년 5월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const firstDayOfMonth = new Date('2025-05-01');
    const week = formatWeek(firstDayOfMonth);

    expect(week).toBe('2025년 5월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const lastDayOfMonth = new Date('2025-05-31');
    const week = formatWeek(lastDayOfMonth);

    expect(week).toBe('2025년 5월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const lastDayOfYear = new Date('2025-12-31');
    const week = formatWeek(lastDayOfYear);

    expect(week).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const lastDayOfLeapYearFeb = new Date('2024-02-29');
    const week = formatWeek(lastDayOfLeapYearFeb);

    expect(week).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const lastDayOfNonLeapYearFeb = new Date('2025-02-28');
    const week = formatWeek(lastDayOfNonLeapYearFeb);

    expect(week).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date('2025-07-10');
    const month = formatMonth(date);

    expect(month).toBe('2025년 7월');
  });

  it("2025년 12월 6일을 '2025년 12월'로 반환한다", () => {
    const date = new Date('2025-12-06');
    const month = formatMonth(date);

    expect(month).toBe('2025년 12월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-10');

    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-01');

    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-31');

    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const date = new Date('2025-06-30');

    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const date = new Date('2025-08-01');

    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const invalidRangeStart = new Date('2025-07-31');
    const invalidRangeEnd = new Date('2025-07-01');

    const date = new Date('2025-07-15');

    expect(isDateInRange(date, invalidRangeStart, invalidRangeEnd)).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5, 2)).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10, 2)).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100, 2)).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0, 2)).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(1)).toBe('01');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(12345, 2)).toBe('12345');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date('2025-07-10');

    expect(formatDate(date)).toBe('2025-07-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2025-07-10');

    expect(formatDate(date, 1)).toBe('2025-07-01');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-7-10');

    expect(formatDate(date)).toBe('2025-07-10');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-07-1');

    expect(formatDate(date)).toBe('2025-07-01');
  });
});
