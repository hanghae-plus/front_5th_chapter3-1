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
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const LEAP_YEAR = 2024;
    expect(getDaysInMonth(LEAP_YEAR, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const NON_LEAP_YEAR = 2025;
    expect(getDaysInMonth(NON_LEAP_YEAR, 2)).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    const INVALID_MONTH = 100;
    const MONTHS_IN_YEAR = 12;
    const EXPECTED_MONTH = getDaysInMonth(2025, INVALID_MONTH % MONTHS_IN_YEAR);

    expect(getDaysInMonth(2025, INVALID_MONTH)).toBe(EXPECTED_MONTH);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const WEDNESDAY = new Date('2025-05-14');

    const EXPECTED_WEEK_DATES = [
      new Date('2025-05-11'),
      new Date('2025-05-12'),
      new Date('2025-05-13'),
      new Date('2025-05-14'),
      new Date('2025-05-15'),
      new Date('2025-05-16'),
      new Date('2025-05-17'),
    ];

    expect(getWeekDates(WEDNESDAY)).toEqual(EXPECTED_WEEK_DATES);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const MONDAY = new Date('2025-05-12');

    const EXPECTED_WEEK_DATES = [
      new Date('2025-05-11'),
      new Date('2025-05-12'),
      new Date('2025-05-13'),
      new Date('2025-05-14'),
      new Date('2025-05-15'),
      new Date('2025-05-16'),
      new Date('2025-05-17'),
    ];

    expect(getWeekDates(MONDAY)).toEqual(EXPECTED_WEEK_DATES);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const SUNDAY = new Date('2025-05-18');

    const EXPECTED_WEEK_DATES = [
      new Date('2025-05-18'),
      new Date('2025-05-19'),
      new Date('2025-05-20'),
      new Date('2025-05-21'),
      new Date('2025-05-22'),
      new Date('2025-05-23'),
      new Date('2025-05-24'),
    ];

    expect(getWeekDates(SUNDAY)).toEqual(EXPECTED_WEEK_DATES);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const DECEMBER_31_WEDNESDAY = new Date('2025-12-31');

    const EXPECTED_WEEK_DATES = [
      new Date('2025-12-28'),
      new Date('2025-12-29'),
      new Date('2025-12-30'),
      new Date('2025-12-31'),
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      new Date('2026-01-03'),
    ];

    expect(getWeekDates(DECEMBER_31_WEDNESDAY)).toEqual(EXPECTED_WEEK_DATES);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const JANUARY_2_FRIDAY = new Date('2026-01-02');

    const EXPECTED_WEEK_DATES = [
      new Date('2025-12-28'),
      new Date('2025-12-29'),
      new Date('2025-12-30'),
      new Date('2025-12-31'),
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      new Date('2026-01-03'),
    ];

    expect(getWeekDates(JANUARY_2_FRIDAY)).toEqual(EXPECTED_WEEK_DATES);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const LEAP_YEAR_FEBRUARY_29 = new Date('2024-02-29');

    const EXPECTED_WEEK_DATES = [
      new Date('2024-02-25'),
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'),
    ];

    expect(getWeekDates(LEAP_YEAR_FEBRUARY_29)).toEqual(EXPECTED_WEEK_DATES);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const LAST_DAY_OF_MONTH = new Date('2025-05-31');

    const EXPECTED_WEEK_DATES = [
      new Date('2025-05-25'),
      new Date('2025-05-26'),
      new Date('2025-05-27'),
      new Date('2025-05-28'),
      new Date('2025-05-29'),
      new Date('2025-05-30'),
      new Date('2025-05-31'),
    ];

    expect(getWeekDates(LAST_DAY_OF_MONTH)).toEqual(EXPECTED_WEEK_DATES);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const JULY_1_2025 = new Date('2025-07-01');

    const EXPECTED_WEEKS = [
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ];

    expect(getWeeksAtMonth(JULY_1_2025)).toEqual(EXPECTED_WEEKS);
  });
});

describe('getEventsForDay', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Event 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: 'Test event 1',
      location: 'Room A',
      category: 'Meeting',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: 'Event 2',
      date: '2025-07-02',
      startTime: '14:00',
      endTime: '15:00',
      description: 'Test event 2',
      location: 'Room B',
      category: 'Meeting',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const date = new Date('2025-07-01');
    const events = getEventsForDay(mockEvents, date.getDate());
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('1');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const date = new Date('2025-07-03');
    const events = getEventsForDay(mockEvents, date.getDate());
    expect(events).toHaveLength(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const date = new Date('2025-07-00');
    const events = getEventsForDay(mockEvents, date.getDate());
    expect(events).toHaveLength(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const date = new Date('2025-07-32');
    const events = getEventsForDay(mockEvents, date.getDate());
    expect(events).toHaveLength(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-15');
    const week = formatWeek(date);
    expect(week).toBe('2025년 7월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-01');
    const week = formatWeek(date);
    expect(week).toBe('2025년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-31');
    const week = formatWeek(date);
    expect(week).toBe('2025년 7월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-12-31');
    const week = formatWeek(date);
    expect(week).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-02-29');
    const week = formatWeek(date);
    expect(week).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-02-28');
    const week = formatWeek(date);
    expect(week).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date('2025-07-10');
    const month = formatMonth(date);
    expect(month).toBe('2025년 7월');
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
    const date = new Date('2025-07-15');
    expect(isDateInRange(date, rangeEnd, rangeStart)).toBe(false);
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
    expect(fillZero(100)).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0)).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(5)).toBe('05');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(100, 2)).toBe('100');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date('2025-07-10');
    expect(formatDate(date)).toBe('2025-07-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2025-07-10');
    expect(formatDate(date, 15)).toBe('2025-07-15');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-01-10');
    expect(formatDate(date)).toBe('2025-01-10');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-07-05');
    expect(formatDate(date)).toBe('2025-07-05');
  });
});
