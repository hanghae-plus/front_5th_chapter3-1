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

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    const month = 1;
    const year = 2025;
    const expectedDays = 31;
    const result = getDaysInMonth(year, month);
    expect(result).toBe(expectedDays);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const month = 4;
    const year = 2025;
    const expectedDays = 30;
    const result = getDaysInMonth(year, month);
    expect(result).toBe(expectedDays);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const month = 2;
    const year = 2024; // 윤년
    const expectedDays = 29;
    const result = getDaysInMonth(year, month);
    expect(result).toBe(expectedDays);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const month = 2;
    const year = 2025; // 평년
    const expectedDays = 28;
    const result = getDaysInMonth(year, month);
    expect(result).toBe(expectedDays);
  });

  it('유효하지 않은 월에 대해 0을 반환한다', () => {
    expect(getDaysInMonth(2025, 13)).toBe(0);
    expect(getDaysInMonth(2025, 0)).toBe(0);
    expect(getDaysInMonth(2025, -1)).toBe(0);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const inputDate = new Date('2025-07-09'); // 수요일
    const result = getWeekDates(inputDate);

    const expectedDates = [
      new Date('2025-07-06'), // 일요일
      new Date('2025-07-07'), // 월요일
      new Date('2025-07-08'), // 화요일
      new Date('2025-07-09'), // 수요일
      new Date('2025-07-10'), // 목요일
      new Date('2025-07-11'), // 금요일
      new Date('2025-07-12'), // 토요일
    ];

    expect(result).toEqual(expectedDates);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const inputDate = new Date('2025-07-07'); // 월요일
    const result = getWeekDates(inputDate);

    const expectedDates = [
      new Date('2025-07-06'), // 일요일
      new Date('2025-07-07'), // 월요일
      new Date('2025-07-08'), // 화요일
      new Date('2025-07-09'), // 수요일
      new Date('2025-07-10'), // 목요일
      new Date('2025-07-11'), // 금요일
      new Date('2025-07-12'), // 토요일
    ];

    expect(result).toEqual(expectedDates);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const inputDate = new Date('2025-07-06'); // 일요일
    const result = getWeekDates(inputDate);

    const expectedDates = [
      new Date('2025-07-06'), // 일요일
      new Date('2025-07-07'), // 월요일
      new Date('2025-07-08'), // 화요일
      new Date('2025-07-09'), // 수요일
      new Date('2025-07-10'), // 목요일
      new Date('2025-07-11'), // 금요일
      new Date('2025-07-12'), // 토요일
    ];

    expect(result).toEqual(expectedDates);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const inputDate = new Date('2025-12-31'); // 수요일
    const result = getWeekDates(inputDate);

    const expectedDates = [
      new Date('2025-12-28'), // 일요일
      new Date('2025-12-29'), // 월요일
      new Date('2025-12-30'), // 화요일
      new Date('2025-12-31'), // 수요일
      new Date('2026-01-01'), // 목요일
      new Date('2026-01-02'), // 금요일
      new Date('2026-01-03'), // 토요일
    ];

    expect(result).toEqual(expectedDates);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const inputDate = new Date('2025-01-01'); // 수요일
    const result = getWeekDates(inputDate);

    const expectedDates = [
      new Date('2024-12-29'), // 일요일
      new Date('2024-12-30'), // 월요일
      new Date('2024-12-31'), // 화요일
      new Date('2025-01-01'), // 수요일
      new Date('2025-01-02'), // 목요일
      new Date('2025-01-03'), // 금요일
      new Date('2025-01-04'), // 토요일
    ];

    expect(result).toEqual(expectedDates);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const inputDate = new Date('2024-02-29');
    const result = getWeekDates(inputDate);

    const expectedDates = [
      new Date('2024-02-25'), // 일요일
      new Date('2024-02-26'), // 월요일
      new Date('2024-02-27'), // 화요일
      new Date('2024-02-28'), // 수요일
      new Date('2024-02-29'), // 목요일
      new Date('2024-03-01'), // 금요일
      new Date('2024-03-02'), // 토요일
    ];

    expect(result).toEqual(expectedDates);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const inputDate = new Date('2025-05-31');
    const result = getWeekDates(inputDate);

    const expectedDates = [
      new Date('2025-05-25'), // 일요일
      new Date('2025-05-26'), // 월요일
      new Date('2025-05-27'), // 화요일
      new Date('2025-05-28'), // 수요일
      new Date('2025-05-29'), // 목요일
      new Date('2025-05-30'), // 금요일
      new Date('2025-05-31'), // 토요일
    ];

    expect(result).toEqual(expectedDates);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const currentDate = new Date('2025-07-01');
    const result = getWeeksAtMonth(currentDate);
    const expectedWeeks = [
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ];
    expect(result).toEqual(expectedWeeks);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events: Event[] = [
      { id: 1, date: '2025-07-01', title: 'Event 1' },
      { id: 2, date: '2025-07-02', title: 'Event 2' },
      { id: 3, date: '2025-07-01', title: 'Event 3' },
    ];

    const date = 1;
    const result = getEventsForDay(events, date);
    const expectedEvents = [
      { id: 1, date: '2025-07-01', title: 'Event 1' },
      { id: 3, date: '2025-07-01', title: 'Event 3' },
    ];
    expect(result).toEqual(expectedEvents);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      { id: 1, date: '2025-07-02', title: 'Event 1' },
      { id: 2, date: '2025-07-03', title: 'Event 2' },
    ];

    const date = 1;
    const result = getEventsForDay(events, date);
    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      { id: 1, date: '2025-07-01', title: 'Event 1' },
      { id: 2, date: '2025-07-02', title: 'Event 2' },
    ];

    const date = 0;
    const result = getEventsForDay(events, date);
    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      { id: 1, date: '2025-07-01', title: 'Event 1' },
      { id: 2, date: '2025-07-02', title: 'Event 2' },
    ];

    const date = 32;
    const result = getEventsForDay(events, date);
    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-05-14');
    const result = formatWeek(date);
    expect(result).toBe('2025년 5월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-05-01');
    const result = formatWeek(date);
    expect(result).toBe('2025년 5월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-05-31');
    const result = formatWeek(date);
    expect(result).toBe('2025년 5월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-12-31');
    const result = formatWeek(date);
    expect(result).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-02-29');
    const result = formatWeek(date);
    expect(result).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-02-28');
    const result = formatWeek(date);
    expect(result).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date('2025-07-10');
    const result = formatMonth(date);
    expect(result).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-10');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-01');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-01');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const date = new Date('2025-06-30');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const date = new Date('2025-08-01');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const date = new Date('2025-08-01');
    const result = isDateInRange(date, rangeStart, rangeEnd);
    expect(result).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const result = fillZero(5, 2);
    expect(result).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const result = fillZero(10, 2);
    expect(result).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const result = fillZero(3, 3);
    expect(result).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const result = fillZero(100, 2);
    expect(result).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const result = fillZero(0, 2);
    expect(result).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const result = fillZero(1, 5);
    expect(result).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const result = fillZero(3.14, 5);
    expect(result).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const result = fillZero(5);
    expect(result).toBe('05');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const result = fillZero(123, 2);
    expect(result).toBe('123');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date('2025-07-01');
    const result = formatDate(date);
    expect(result).toBe('2025-07-01');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2025-07-01');
    const result = formatDate(date, 15);
    expect(result).toBe('2025-07-15');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-07-01');
    const result = formatDate(date);
    expect(result).toBe('2025-07-01');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-07-01');
    const result = formatDate(date, 5);
    expect(result).toBe('2025-07-05');
  });
});
