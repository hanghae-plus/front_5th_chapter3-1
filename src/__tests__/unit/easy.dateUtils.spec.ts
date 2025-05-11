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
import { mockTestData } from '../data/mockTestData';

const toYMD = (d: Date) => [d.getFullYear(), d.getMonth() + 1, d.getDate()];

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  test.each([
    [2024, 2, 29], // 윤년 2월
    [2000, 2, 29], // 세기 윤년 (400의 배수)
  ])('윤년의 2월에 대해 29일을 반환한다', (year, month, expected) => {
    expect(getDaysInMonth(year, month)).toBe(expected);
  });

  test.each([
    [2025, 2, 28], // 평년 2월
    [1900, 2, 28], // 세기 평년 (100의 배수지만 400의 배수 아님)
  ])('평년의 2월에 대해 28일을 반환한다', (year, month, expected) => {
    expect(getDaysInMonth(year, month)).toBe(expected);
  });

  it.each([0, 13, -5, 100])('유효하지 않은 월에 대해 적절히 처리한다', (invalidMonth) => {
    expect(() => getDaysInMonth(2025, invalidMonth)).toThrow(RangeError);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const input = new Date(2025, 4, 14); // 2025-5-14 수
    const week = getWeekDates(input);
    const expected = [
      [2025, 5, 11],
      [2025, 5, 12],
      [2025, 5, 13],
      [2025, 5, 14],
      [2025, 5, 15],
      [2025, 5, 16],
      [2025, 5, 17],
    ];
    expect(week.map(toYMD)).toEqual(expected);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const input = new Date(2025, 4, 12); // 2025-5-12 월
    const week = getWeekDates(input);
    const expected = [
      [2025, 5, 11],
      [2025, 5, 12],
      [2025, 5, 13],
      [2025, 5, 14],
      [2025, 5, 15],
      [2025, 5, 16],
      [2025, 5, 17],
    ];
    expect(week.map(toYMD)).toEqual(expected);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const input = new Date(2025, 4, 11); // 2025-5-11 일
    const week = getWeekDates(input);
    const expected = [
      [2025, 5, 11],
      [2025, 5, 12],
      [2025, 5, 13],
      [2025, 5, 14],
      [2025, 5, 15],
      [2025, 5, 16],
      [2025, 5, 17],
    ];
    expect(week.map(toYMD)).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const input = new Date(2025, 11, 31); // 2025-12-31 수
    const week = getWeekDates(input);
    const expected = [
      [2025, 12, 28],
      [2025, 12, 29],
      [2025, 12, 30],
      [2025, 12, 31],
      [2026, 1, 1],
      [2026, 1, 2],
      [2026, 1, 3],
    ];
    expect(week.map(toYMD)).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const input = new Date(2026, 0, 1); // 2026-1-1 목
    const week = getWeekDates(input);
    const expected = [
      [2025, 12, 28],
      [2025, 12, 29],
      [2025, 12, 30],
      [2025, 12, 31],
      [2026, 1, 1],
      [2026, 1, 2],
      [2026, 1, 3],
    ];
    expect(week.map(toYMD)).toEqual(expected);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const input = new Date(2024, 1, 29); // 2024-2-29 목
    const week = getWeekDates(input);
    const expected = [
      [2024, 2, 25],
      [2024, 2, 26],
      [2024, 2, 27],
      [2024, 2, 28],
      [2024, 2, 29],
      [2024, 3, 1],
      [2024, 3, 2],
    ];
    expect(week.map(toYMD)).toEqual(expected);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const input = new Date(2025, 6, 31); // 2025-07-31 목
    const week = getWeekDates(input);
    const expected = [
      [2025, 7, 27],
      [2025, 7, 28],
      [2025, 7, 29],
      [2025, 7, 30],
      [2025, 7, 31],
      [2025, 8, 1],
      [2025, 8, 2],
    ];
    expect(week.map(toYMD)).toEqual(expected);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const input = new Date(2025, 6, 1); // 2025-7-1 월
    const week = getWeeksAtMonth(input);
    const expected = [
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ];
    expect(week).toEqual(expected);
  });
});

describe('getEventsForDay', () => {
  const sampleEvents = mockTestData;

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(sampleEvents, 1);
    expect(result.map((e) => e.id)).toEqual(['1', '3']);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(sampleEvents, 3);
    expect(result.length).toBe(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(sampleEvents, 0);
    expect(result.length).toBe(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(sampleEvents, 32);
    expect(result.length).toBe(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const input = new Date(2025, 6, 10);
    const expected = '2025년 7월 2주';
    expect(formatWeek(input)).toBe(expected);
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const input = new Date(2025, 6, 1);
    const expected = '2025년 7월 1주';
    expect(formatWeek(input)).toBe(expected);
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const input = new Date(2025, 6, 31);
    const expected = '2025년 7월 5주';
    expect(formatWeek(input)).toBe(expected);
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const input = new Date(2025, 11, 31);
    const expected = '2026년 1월 1주';
    expect(formatWeek(input)).toBe(expected);
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const input = new Date(2024, 1, 29);
    const expected = '2024년 2월 5주';
    expect(formatWeek(input)).toBe(expected);
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const input = new Date(2025, 2, 31);
    const expected = '2025년 4월 1주';
    expect(formatWeek(input)).toBe(expected);
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const input = new Date(2025, 6, 10);
    const expected = '2025년 7월';
    expect(formatMonth(input)).toBe(expected);
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const input = new Date('2025-07-10');
    expect(isDateInRange(input, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const input = new Date('2025-07-01');
    expect(isDateInRange(input, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const input = new Date('2025-07-31');
    expect(isDateInRange(input, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const input = new Date('2025-06-30');
    expect(isDateInRange(input, rangeStart, rangeEnd)).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const input = new Date('2025-08-01');
    expect(isDateInRange(input, rangeStart, rangeEnd)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const rangeStart = new Date('2025-07-31');
    const rangeEnd = new Date('2025-07-01');
    const input1 = new Date('2025-07-10');
    const input2 = new Date('2025-07-01');
    expect(isDateInRange(input1, rangeStart, rangeEnd)).toBe(false);
    expect(isDateInRange(input2, rangeStart, rangeEnd)).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5)).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10)).toBe('10');
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
    expect(fillZero(5)).toBe('05');
    expect(fillZero(0)).toBe('00');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(123, 2)).toBe('123');
    expect(fillZero(12345, 4)).toBe('12345');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const input = new Date(2025, 6, 10);
    const expected = '2025-07-10';
    expect(formatDate(input)).toBe(expected);
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const input = new Date(2025, 6, 10);
    const expected = '2025-07-10';
    expect(formatDate(input, 10)).toBe(expected);
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const input = new Date(2025, 6, 10);
    const expected = '2025-07-10';
    expect(formatDate(input)).toBe(expected);
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const input = new Date(2025, 6, 1);
    const expected = '2025-07-01';
    expect(formatDate(input)).toBe(expected);
  });
});
