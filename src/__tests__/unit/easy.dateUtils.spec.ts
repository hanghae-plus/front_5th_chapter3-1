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
  const currentYear = new Date().getFullYear();

  it('1월은 31일 수를 반환한다', () => {
    const daysInJanuary = getDaysInMonth(currentYear, 1);
    expect(daysInJanuary).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const daysInApril = getDaysInMonth(currentYear, 4);
    expect(daysInApril).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const daysInFebruary = getDaysInMonth(2024, 2);
    expect(daysInFebruary).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const daysInFebruary = getDaysInMonth(2025, 2);
    expect(daysInFebruary).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    const daysInInvalidMonth1 = getDaysInMonth(currentYear, 0);
    expect(daysInInvalidMonth1).toBe(0);

    const daysInInvalidMonth2 = getDaysInMonth(currentYear, 13);
    expect(daysInInvalidMonth2).toBe(0);
  });
});

describe('getWeekDates', () => {
  const getDateWithDay = (day: number = 0, date?: Date) => {
    const currentDate = date ?? new Date();
    const currentDay = currentDate.getDay();
    return currentDate.getDate() + (day - currentDay);
  };

  const createDate = (baseDate: number, offset: number, date?: Date) => {
    const currentDate = date ?? new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    return new Date(currentYear, currentMonth, baseDate + offset);
  };

  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const wednesdayDate = getDateWithDay(3);
    const weekDates = getWeekDates(createDate(wednesdayDate, 0));
    const expectedResult = [
      createDate(wednesdayDate, -3),
      createDate(wednesdayDate, -2),
      createDate(wednesdayDate, -1),
      createDate(wednesdayDate, 0),
      createDate(wednesdayDate, 1),
      createDate(wednesdayDate, 2),
      createDate(wednesdayDate, 3),
    ];

    expect(weekDates).toEqual(expectedResult);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const mondayDate = getDateWithDay(1);
    const weekDates = getWeekDates(createDate(mondayDate, 0));
    const expectedResult = [
      createDate(mondayDate, -1),
      createDate(mondayDate, 0),
      createDate(mondayDate, 1),
      createDate(mondayDate, 2),
      createDate(mondayDate, 3),
      createDate(mondayDate, 4),
      createDate(mondayDate, 5),
    ];

    expect(weekDates).toEqual(expectedResult);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sundayDate = getDateWithDay(0);
    const weekDates = getWeekDates(createDate(sundayDate, 0));
    const expectedResult = [
      createDate(sundayDate, 0),
      createDate(sundayDate, 1),
      createDate(sundayDate, 2),
      createDate(sundayDate, 3),
      createDate(sundayDate, 4),
      createDate(sundayDate, 5),
      createDate(sundayDate, 6),
    ];

    expect(weekDates).toEqual(expectedResult);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date();
    date.setMonth(11);
    date.setDate(31);
    const sundayDate = getDateWithDay(0, date);
    const weekDates = getWeekDates(createDate(sundayDate, 0, date));
    const expectedResult = [
      createDate(sundayDate, 0, date),
      createDate(sundayDate, 1, date),
      createDate(sundayDate, 2, date),
      createDate(sundayDate, 3, date),
      createDate(sundayDate, 4, date),
      createDate(sundayDate, 5, date),
      createDate(sundayDate, 6, date),
    ];

    expect(weekDates).toEqual(expectedResult);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date();
    date.setMonth(0);
    date.setDate(1);
    const sundayDate = getDateWithDay(0, date);
    const weekDates = getWeekDates(createDate(sundayDate, 0, date));
    const expectedResult = [
      createDate(sundayDate, 0, date),
      createDate(sundayDate, 1, date),
      createDate(sundayDate, 2, date),
      createDate(sundayDate, 3, date),
      createDate(sundayDate, 4, date),
      createDate(sundayDate, 5, date),
      createDate(sundayDate, 6, date),
    ];

    expect(weekDates).toEqual(expectedResult);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date();
    date.setFullYear(2024);
    date.setMonth(1);
    date.setDate(29);
    const sundayDate = getDateWithDay(0, date);
    const weekDates = getWeekDates(createDate(sundayDate, 0, date));
    const expectedResult = [
      createDate(sundayDate, 0, date),
      createDate(sundayDate, 1, date),
      createDate(sundayDate, 2, date),
      createDate(sundayDate, 3, date),
      createDate(sundayDate, 4, date),
      createDate(sundayDate, 5, date),
      createDate(sundayDate, 6, date),
    ];

    expect(weekDates).toEqual(expectedResult);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    const sundayDate = getDateWithDay(0, date);
    const weekDates = getWeekDates(createDate(sundayDate, 0, date));
    const expectedResult = [
      createDate(sundayDate, 0, date),
      createDate(sundayDate, 1, date),
      createDate(sundayDate, 2, date),
      createDate(sundayDate, 3, date),
      createDate(sundayDate, 4, date),
      createDate(sundayDate, 5, date),
      createDate(sundayDate, 6, date),
    ];

    expect(weekDates).toEqual(expectedResult);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const currentDate = new Date('2025-07-01');
    const weeks = getWeeksAtMonth(currentDate);
    expect(weeks).toEqual([
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ]);
  });
});

describe('getEventsForDay', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '첫 번째 이벤트',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '첫 번째 이벤트 설명',
      location: '첫 번째 이벤트 장소',
      category: '첫 번째 이벤트 카테고리',
      repeat: {
        type: 'none',
        interval: 0,
        endDate: '2025-07-01',
      },
      notificationTime: 0,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const eventsForDay = getEventsForDay(events, 1);
    expect(eventsForDay).toEqual([events[0]]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const eventsForDay = getEventsForDay(events, 2);
    expect(eventsForDay).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const eventsForDay = getEventsForDay(events, 0);
    expect(eventsForDay).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const eventsForDay = getEventsForDay(events, 32);
    expect(eventsForDay).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2025-05-12'));
    expect(week).toBe('2025년 5월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2025-05-01'));
    expect(week).toBe('2025년 5월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2025-05-31'));
    expect(week).toBe('2025년 5월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const week1 = formatWeek(new Date('2025-12-31'));
    expect(week1).toBe('2026년 1월 1주');

    const week2 = formatWeek(new Date('2026-12-31'));
    expect(week2).toBe('2026년 12월 5주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2024-02-29'));
    expect(week).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2025-02-28'));
    expect(week).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const month = formatMonth(new Date('2025-07-10'));
    expect(month).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const isInRange = isDateInRange(new Date('2025-07-10'), rangeStart, rangeEnd);
    expect(isInRange).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const isInRange = isDateInRange(new Date('2025-07-01'), rangeStart, rangeEnd);
    expect(isInRange).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const isInRange = isDateInRange(new Date('2025-07-31'), rangeStart, rangeEnd);
    expect(isInRange).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const isInRange = isDateInRange(new Date('2025-06-30'), rangeStart, rangeEnd);
    expect(isInRange).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const isInRange = isDateInRange(new Date('2025-08-01'), rangeStart, rangeEnd);
    expect(isInRange).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const isInRange = isDateInRange(new Date('2025-07-31'), rangeEnd, rangeStart);
    expect(isInRange).toBe(false);
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
    const result = fillZero(100);
    expect(result).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const result = fillZero(0);
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
    const result = formatDate(new Date('2025-07-10'));
    expect(result).toBe('2025-07-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const result = formatDate(new Date('2025-07-10'), 1);
    expect(result).toBe('2025-07-01');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const result = formatDate(new Date('2025-07-10'), 1);
    expect(result).toBe('2025-07-01');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const result = formatDate(new Date('2025-07-10'), 1);
    expect(result).toBe('2025-07-01');
  });
});
