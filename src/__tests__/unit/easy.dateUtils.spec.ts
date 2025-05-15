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
} from '@/entities/event/lib/dateUtils';
import { Event } from '@/entities/event/model/types';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    const YEAR = 2025;
    const MONTH = 1;
    const result = getDaysInMonth(YEAR, MONTH);
    expect(result).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const YEAR = 2025;
    const MONTH = 4;
    const result = getDaysInMonth(YEAR, MONTH);
    expect(result).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const YEAR = 2024;
    const MONTH = 2;
    const result = getDaysInMonth(YEAR, MONTH);
    expect(result).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const YEAR = 2025;
    const MONTH = 2;
    const result = getDaysInMonth(YEAR, MONTH);
    expect(result).toBe(28);
  });

  it('유효하지 않은 월에 대해 0을 반환한다', () => {
    const YEAR = 2025;
    const MONTH = 14;
    const result = getDaysInMonth(YEAR, MONTH);
    expect(result).toBe(0);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 해당하는 주의 날짜들을 모두 반환한다', () => {
    const WEDNESDAY = new Date('2025-05-07');
    const result = getWeekDates(WEDNESDAY);
    expect(result).toEqual([
      new Date('2025-05-04'),
      new Date('2025-05-05'),
      new Date('2025-05-06'),
      new Date('2025-05-07'),
      new Date('2025-05-08'),
      new Date('2025-05-09'),
      new Date('2025-05-10'),
    ]);
  });

  // TODO: 기존 달력에는 주의 시작이 일요일 아닌가?
  it('주의 시작(일요일)에 대해 해당하는 주의 날짜들을 모두 반환한다', () => {
    const SUNDAY = new Date('2025-05-04');
    const result = getWeekDates(SUNDAY);
    expect(result).toEqual([
      new Date('2025-05-04'),
      new Date('2025-05-05'),
      new Date('2025-05-06'),
      new Date('2025-05-07'),
      new Date('2025-05-08'),
      new Date('2025-05-09'),
      new Date('2025-05-10'),
    ]);
  });

  it('주의 끝(토요일)에 대해 해당하는 주의 날짜들을 모두 반환한다', () => {
    const SATURDAY = new Date('2025-05-10');
    const result = getWeekDates(SATURDAY);
    expect(result).toEqual([
      new Date('2025-05-04'),
      new Date('2025-05-05'),
      new Date('2025-05-06'),
      new Date('2025-05-07'),
      new Date('2025-05-08'),
      new Date('2025-05-09'),
      new Date('2025-05-10'),
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const FINAL_DAY_OF_YEAR = new Date('2025-12-31');
    const result = getWeekDates(FINAL_DAY_OF_YEAR);
    expect(result).toEqual([
      new Date('2025-12-28'),
      new Date('2025-12-29'),
      new Date('2025-12-30'),
      new Date('2025-12-31'),
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      new Date('2026-01-03'),
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const FIRST_DAY_OF_YEAR = new Date('2026-01-01');
    const result = getWeekDates(FIRST_DAY_OF_YEAR);
    expect(result).toEqual([
      new Date('2025-12-28'),
      new Date('2025-12-29'),
      new Date('2025-12-30'),
      new Date('2025-12-31'),
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      new Date('2026-01-03'),
    ]);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const LEAP_YEAR_FEBRUARY_29 = new Date('2024-02-29');
    const result = getWeekDates(LEAP_YEAR_FEBRUARY_29);
    expect(result).toEqual([
      new Date('2024-02-25'),
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'),
    ]);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const LAST_DAY_OF_MONTH = new Date('2025-05-31');
    const result = getWeekDates(LAST_DAY_OF_MONTH);
    expect(result).toEqual([
      new Date('2025-05-25'),
      new Date('2025-05-26'),
      new Date('2025-05-27'),
      new Date('2025-05-28'),
      new Date('2025-05-29'),
      new Date('2025-05-30'),
      new Date('2025-05-31'),
    ]);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 5월 1일이 포함된 달의 올바른 주 정보를 반환해야 한다', () => {
    const MAY_1 = new Date('2025-05-01');
    const result = getWeeksAtMonth(MAY_1);
    expect(result).toEqual([
      [null, null, null, null, 1, 2, 3],
      [4, 5, 6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15, 16, 17],
      [18, 19, 20, 21, 22, 23, 24],
      [25, 26, 27, 28, 29, 30, 31],
    ]);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const EVENTS: Event[] = [
      {
        id: '1',
        title: '이벤트1',
        date: '2025-05-03',
        startTime: '00:00',
        endTime: '00:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트2',
        date: '2025-05-02',
        startTime: '00:00',
        endTime: '00:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '이벤트3',
        date: '2025-05-01',
        startTime: '00:00',
        endTime: '00:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const result = getEventsForDay(EVENTS, 1);
    expect(result).toEqual([
      {
        id: '3',
        title: '이벤트3',
        date: '2025-05-01',
        startTime: '00:00',
        endTime: '00:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const EVENT: Event[] = [
      {
        id: '1',
        title: '이벤트1',
        date: '2025-07-03',
        startTime: '00:00',
        endTime: '00:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const result = getEventsForDay(EVENT, 1);
    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const EVENT: Event[] = [
      {
        id: '1',
        title: '이벤트1',
        date: '2025-07-03',
        startTime: '00:00',
        endTime: '00:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const result = getEventsForDay(EVENT, 0);
    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const EVENT: Event[] = [
      {
        id: '1',
        title: '이벤트1',
        date: '2025-07-03',
        startTime: '00:00',
        endTime: '00:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const result = getEventsForDay(EVENT, 32);
    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const MIDDLE_DAY_OF_MONTH = new Date('2025-05-15');
    const result = formatWeek(MIDDLE_DAY_OF_MONTH);
    expect(result).toBe('2025년 5월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const FIRST_DAY_OF_MONTH = new Date('2025-05-01');
    const result = formatWeek(FIRST_DAY_OF_MONTH);
    expect(result).toBe('2025년 5월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const LAST_DAY_OF_MONTH = new Date('2025-05-31');
    const result = formatWeek(LAST_DAY_OF_MONTH);
    expect(result).toBe('2025년 5월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const LAST_DAY_OF_YEAR = new Date('2025-12-31');
    const result = formatWeek(LAST_DAY_OF_YEAR);
    expect(result).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const LAST_DAY_OF_YEAR = new Date('2024-02-29'); // 2월 1일이 1주차
    const result = formatWeek(LAST_DAY_OF_YEAR);
    expect(result).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const LAST_DAY_OF_YEAR = new Date('2025-02-28'); // 2월 1일이 1월 5주차
    const result = formatWeek(LAST_DAY_OF_YEAR);
    expect(result).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const targetDate = new Date('2025-07-10');
    const result = formatMonth(targetDate);
    expect(result).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const targetDate = new Date('2025-07-10');
    const result = isDateInRange(targetDate, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const targetDate = new Date('2025-07-01');
    const result = isDateInRange(targetDate, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const targetDate = new Date('2025-07-31');
    const result = isDateInRange(targetDate, rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const targetDate = new Date('2025-06-30');
    const result = isDateInRange(targetDate, rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const targetDate = new Date('2025-08-01');
    const result = isDateInRange(targetDate, rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const targetDate = new Date('2025-05-10');
    const result = isDateInRange(targetDate, rangeEnd, rangeStart);
    expect(result).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const value = 5;
    const size = 2;
    const result = fillZero(value, size);
    expect(result).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const value = 10;
    const size = 2;
    const result = fillZero(value, size);
    expect(result).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const value = 3;
    const size = 3;
    const result = fillZero(value, size);
    expect(result).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const value = 100;
    const size = 2;
    const result = fillZero(value, size);
    expect(result).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const value = 0;
    const size = 2;
    const result = fillZero(value, size);
    expect(result).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const value = 1;
    const size = 5;
    const result = fillZero(value, size);
    expect(result).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const value = 3.14;
    const size = 5;
    const result = fillZero(value, size);
    expect(result).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const value = 3;
    const result = fillZero(value);
    expect(result).toBe('03');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const value = 1000000;
    const size = 2;
    const result = fillZero(value, size);
    expect(result).toBe('1000000');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const currentDate = new Date('2025-05-11');
    const result = formatDate(currentDate);
    expect(result).toBe('2025-05-11');
  });

  it('day 파라미터가 제공되면 특정 날짜의 년도와 월은 유지하면서 해당 일자만 변경하여 포맷팅한다', () => {
    const currentDate = new Date('2025-05-11');
    const day = 13;
    const result = formatDate(currentDate, day);
    expect(result).toBe('2025-05-13');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const currentDate = new Date('2025-05-11');
    const result = formatDate(currentDate);
    expect(result).toBe('2025-05-11');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const currentDate = new Date('2025-05-01');
    const result = formatDate(currentDate);
    expect(result).toBe('2025-05-01');
  });
});
