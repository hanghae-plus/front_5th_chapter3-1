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
import { makeEvents } from '../utils';

describe('getDaysInMonth', () => {
  const TODAY = new Date();

  const CURRENT_YEAR = TODAY.getFullYear();
  const LEAP_YEAR = 2028;
  const NON_LEAP_YEAR = 2027;
  const INVALID_MONTH = 14;

  it('1월은 31일 수를 반환한다', () => {
    const result = getDaysInMonth(CURRENT_YEAR, 1);

    expect(result).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const result = getDaysInMonth(CURRENT_YEAR, 4);

    expect(result).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const result = getDaysInMonth(LEAP_YEAR, 2);

    expect(result).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const result = getDaysInMonth(NON_LEAP_YEAR, 2);

    expect(result).toBe(28);
  });

  it('유효하지 않은 월에 대해 -1을 반환한다', () => {
    const result = getDaysInMonth(CURRENT_YEAR, INVALID_MONTH);

    expect(result).toBe(-1);
  });
});

describe('getWeekDates', () => {
  const DATE = {
    sunday: new Date('2024-12-29'),
    monday: new Date('2024-12-30'),
    tuesday: new Date('2024-12-31'),
    wednesday: new Date('2025-01-01'),
    thursday: new Date('2025-01-02'),
    friday: new Date('2025-01-03'),
    saturday: new Date('2025-01-04'),
  };
  const LEAP_DATE = {
    sunday: new Date('2028-02-27'),
    monday: new Date('2028-02-28'),
    tuesday: new Date('2028-02-29'),
    wednesday: new Date('2028-03-01'),
    thursday: new Date('2028-03-02'),
    friday: new Date('2028-03-03'),
    saturday: new Date('2028-03-04'),
  };

  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const result = getWeekDates(DATE.wednesday);

    expect(result).toEqual([
      DATE.sunday,
      DATE.monday,
      DATE.tuesday,
      DATE.wednesday,
      DATE.thursday,
      DATE.friday,
      DATE.saturday,
    ]);
  });

  it('주의 끝(토요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const result = getWeekDates(DATE.saturday);

    expect(result).toEqual([
      DATE.sunday,
      DATE.monday,
      DATE.tuesday,
      DATE.wednesday,
      DATE.thursday,
      DATE.friday,
      DATE.saturday,
    ]);
  });

  it('주의 시작(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const result = getWeekDates(DATE.sunday);

    expect(result).toEqual([
      DATE.sunday,
      DATE.monday,
      DATE.tuesday,
      DATE.wednesday,
      DATE.thursday,
      DATE.friday,
      DATE.saturday,
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const result = getWeekDates(DATE.monday);

    expect(result).toEqual([
      DATE.sunday,
      DATE.monday,
      DATE.tuesday,
      DATE.wednesday,
      DATE.thursday,
      DATE.friday,
      DATE.saturday,
    ]);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const result = getWeekDates(LEAP_DATE.monday);

    expect(result).toEqual([
      LEAP_DATE.sunday,
      LEAP_DATE.monday,
      LEAP_DATE.tuesday,
      LEAP_DATE.wednesday,
      LEAP_DATE.thursday,
      LEAP_DATE.friday,
      LEAP_DATE.saturday,
    ]);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const result = getWeekDates(DATE.tuesday);

    expect(result).toEqual([
      DATE.sunday,
      DATE.monday,
      DATE.tuesday,
      DATE.wednesday,
      DATE.thursday,
      DATE.friday,
      DATE.saturday,
    ]);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const result = getWeeksAtMonth(new Date('2025-07-01'));

    const MONTH = 7;

    // 이전/이후 주의 날짜는 모두 null로 처리
    const processingWeekDates = (date: Date) =>
      getWeekDates(date).map((date) => (date.getMonth() + 1 === MONTH ? date.getDate() : null));

    const expected = [
      processingWeekDates(new Date('2025-07-01')),
      processingWeekDates(new Date('2025-07-08')),
      processingWeekDates(new Date('2025-07-15')),
      processingWeekDates(new Date('2025-07-22')),
      processingWeekDates(new Date('2025-07-29')),
    ];

    expect(result).toEqual(expected);
  });
});

describe('getEventsForDay', () => {
  const EVENTS = makeEvents(9).map((event, index) => ({
    ...event,
    date: new Date(`2025-07-0${index + 1}`).toISOString().split('T')[0],
  }));

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(EVENTS, 1);

    expect(result).toEqual([EVENTS[0]]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(EVENTS, 10);

    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(EVENTS, 0);

    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(EVENTS, 32);

    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  const DATE = {
    firstWeek: new Date('2025-07-01'),
    secondWeek: new Date('2025-07-08'),
    thirdWeek: new Date('2025-07-15'),
    fourthWeek: new Date('2025-07-22'),
    fifthWeek: new Date('2025-07-29'),

    middleWeek: new Date('2025-07-15'),
    lastWeek: new Date('2025-07-29'),
  };
  const LEAP_DATE = new Date('2028-02-29');
  const NON_LEAP_DATE = new Date('2027-02-28');

  it('2025년 7월 15일은 3주차 정보를 반환한다', () => {
    const result = formatWeek(DATE.middleWeek);

    expect(result).toBe('2025년 7월 3주');
  });

  it('2025년 7월 1일은 1주차 정보를 반환한다', () => {
    const result = formatWeek(DATE.firstWeek);

    expect(result).toBe('2025년 7월 1주');
  });

  it('2025년 7월 29일은 5주차 정보를 반환한다', () => {
    const result = formatWeek(DATE.lastWeek);

    expect(result).toBe('2025년 7월 5주');
  });

  it('2024년 12월 31일은 2025년 1월 1주차 정보를 반환한다', () => {
    const result = formatWeek(new Date('2024-12-31'));

    expect(result).toBe('2025년 1월 1주');
  });

  it('[윤년] 2028년 2월 29일은 2028년 3월 1주차 정보를 반환한다', () => {
    const result = formatWeek(LEAP_DATE);

    expect(result).toBe('2028년 3월 1주');
  });

  it('[평년] 2027년 2월 28일은 2027년 3월 1주차 정보를 반환한다', () => {
    const result = formatWeek(NON_LEAP_DATE);

    expect(result).toBe('2027년 3월 1주');
  });

  it('🐬 주에 여러달이 겹치는 경우 목요일 기준으로 결정 (더 많은 일이 포함된 달의 주 정보를 반환)', () => {
    // 목요일은 7월 31일
    const previousWeek = formatWeek(new Date('2025-07-28'));
    // 목요일은 10월 02일
    const nextWeek = formatWeek(new Date('2025-09-30'));

    expect(previousWeek).toBe('2025년 7월 5주');
    expect(nextWeek).toBe('2025년 10월 1주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const result = formatMonth(new Date('2025-07-10'));

    expect(result).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const result = isDateInRange(new Date('2025-07-10'), rangeStart, rangeEnd);

    expect(result).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const result = isDateInRange(new Date('2025-07-01'), rangeStart, rangeEnd);

    expect(result).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const result = isDateInRange(new Date('2025-07-31'), rangeStart, rangeEnd);

    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const result = isDateInRange(new Date('2025-06-30'), rangeStart, rangeEnd);

    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const result = isDateInRange(new Date('2025-08-01'), rangeStart, rangeEnd);

    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const result = isDateInRange(new Date('2025-07-20'), rangeEnd, rangeStart);

    expect(result).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const result = fillZero(5);

    expect(result).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const result = fillZero(10);

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
    const result = fillZero(1);

    expect(result).toBe('01');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const result = fillZero(12345, 2);

    expect(result).toBe('12345');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const result = formatDate(new Date('2025-07-01'));

    expect(result).toBe('2025-07-01');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const result = formatDate(new Date('2025-07-01'), 1);

    expect(result).toBe('2025-07-01');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const result = formatDate(new Date('2025-7-01'));

    expect(result).toBe('2025-07-01');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const result = formatDate(new Date('2025-07-1'));

    expect(result).toBe('2025-07-01');
  });
});
