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
import { assertDate } from '../utils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    const year = 2025;
    const month = 1;

    const days = getDaysInMonth(year, month);

    expect(days).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const year = 2025;
    const month = 4;

    const days = getDaysInMonth(year, month);

    expect(days).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const year = 2024;
    const month = 2;

    const days = getDaysInMonth(year, month);

    expect(days).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const year = 2025;
    const month = 2;

    const days = getDaysInMonth(year, month);

    expect(days).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    const year = 2025;
    const month = 13;

    const days = getDaysInMonth(year, month);

    expect(days).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const wednesday = new Date(2025, 4, 14);

    const weekDates = getWeekDates(wednesday);

    weekDates.forEach((date, i) => {
      assertDate(date, new Date(2025, 4, 11 + i));
    });
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const monday = new Date(2025, 4, 12);

    const weekDates = getWeekDates(monday);

    weekDates.forEach((date, i) => {
      assertDate(date, new Date(2025, 4, 11 + i));
    });
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sunday = new Date(2025, 4, 18);

    const weekDates = getWeekDates(sunday);

    weekDates.forEach((date, i) => {
      assertDate(date, new Date(2025, 4, 18 + i));
    });
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const endOfYear = new Date(2025, 11, 31);

    const weekDates = getWeekDates(endOfYear);

    weekDates.forEach((date, i) => {
      assertDate(date, new Date(2025, 11, 28 + i));
    });
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const startOfYear = new Date(2025, 0, 1);

    const weekDates = getWeekDates(startOfYear);

    weekDates.forEach((date, i) => {
      assertDate(date, new Date(2024, 11, 29 + i));
    });
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const leapYear = new Date(2024, 1, 29);

    const weekDates = getWeekDates(leapYear);

    weekDates.forEach((date, i) => {
      assertDate(date, new Date(2024, 1, 25 + i));
    });
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const lastDayOfMonth = new Date(2025, 4, 31);

    const weekDates = getWeekDates(lastDayOfMonth);

    weekDates.forEach((date, i) => {
      assertDate(date, new Date(2025, 4, 25 + i));
    });
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date(2025, 6, 1);
    const expected = [
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ];

    const weeks = getWeeksAtMonth(date);

    weeks.forEach((week, i) => {
      week.forEach((day, j) => {
        expect(day).toBe(expected[i][j]);
      });
    });
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트1 설명',
        location: '이벤트1 장소',
        category: '이벤트1 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '이벤트2',
        date: '2025-07-01',
        startTime: '12:00',
        endTime: '13:00',
        description: '이벤트2 설명',
        location: '이벤트2 장소',
        category: '이벤트2 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: '3',
        title: '이벤트3',
        date: '2025-07-02',
        startTime: '14:00',
        endTime: '15:00',
        description: '이벤트3 설명',
        location: '이벤트3 장소',
        category: '이벤트3 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: '4',
        title: '이벤트4',
        date: '2025-07-03',
        startTime: '16:00',
        endTime: '17:00',
        description: '이벤트4 설명',
        location: '이벤트4 장소',
        category: '이벤트4 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
    ];
    const date = 1;

    const eventsForDay = getEventsForDay(events, date);

    expect(eventsForDay).toEqual([events[0], events[1]]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트1 설명',
        location: '이벤트1 장소',
        category: '이벤트1 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '이벤트2',
        date: '2025-07-01',
        startTime: '12:00',
        endTime: '13:00',
        description: '이벤트2 설명',
        location: '이벤트2 장소',
        category: '이벤트2 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: '3',
        title: '이벤트3',
        date: '2025-07-02',
        startTime: '14:00',
        endTime: '15:00',
        description: '이벤트3 설명',
        location: '이벤트3 장소',
        category: '이벤트3 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: '4',
        title: '이벤트4',
        date: '2025-07-03',
        startTime: '16:00',
        endTime: '17:00',
        description: '이벤트4 설명',
        location: '이벤트4 장소',
        category: '이벤트4 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
    ];
    const date = 4;

    const eventsForDay = getEventsForDay(events, date);

    expect(eventsForDay).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트1 설명',
        location: '이벤트1 장소',
        category: '이벤트1 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '이벤트2',
        date: '2025-07-01',
        startTime: '12:00',
        endTime: '13:00',
        description: '이벤트2 설명',
        location: '이벤트2 장소',
        category: '이벤트2 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: '3',
        title: '이벤트3',
        date: '2025-07-02',
        startTime: '14:00',
        endTime: '15:00',
        description: '이벤트3 설명',
        location: '이벤트3 장소',
        category: '이벤트3 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: '4',
        title: '이벤트4',
        date: '2025-07-03',
        startTime: '16:00',
        endTime: '17:00',
        description: '이벤트4 설명',
        location: '이벤트4 장소',
        category: '이벤트4 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
    ];
    const date = 0;

    const eventsForDay = getEventsForDay(events, date);

    expect(eventsForDay).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '이벤트1 설명',
        location: '이벤트1 장소',
        category: '이벤트1 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '이벤트2',
        date: '2025-07-01',
        startTime: '12:00',
        endTime: '13:00',
        description: '이벤트2 설명',
        location: '이벤트2 장소',
        category: '이벤트2 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: '3',
        title: '이벤트3',
        date: '2025-07-02',
        startTime: '14:00',
        endTime: '15:00',
        description: '이벤트3 설명',
        location: '이벤트3 장소',
        category: '이벤트3 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: '4',
        title: '이벤트4',
        date: '2025-07-03',
        startTime: '16:00',
        endTime: '17:00',
        description: '이벤트4 설명',
        location: '이벤트4 장소',
        category: '이벤트4 카테고리',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
    ];
    const date = 32;

    const eventsForDay = getEventsForDay(events, date);

    expect(eventsForDay).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-05-15');

    const formattedWeek = formatWeek(date);

    expect(formattedWeek).toBe('2025년 5월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-05-01');

    const formattedWeek = formatWeek(date);

    expect(formattedWeek).toBe('2025년 5월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-05-31');

    const formattedWeek = formatWeek(date);

    expect(formattedWeek).toBe('2025년 5월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-12-30');

    const formattedWeek = formatWeek(date);

    expect(formattedWeek).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-02-29');

    const formattedWeek = formatWeek(date);

    expect(formattedWeek).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-02-28');

    const formattedWeek = formatWeek(date);

    expect(formattedWeek).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date('2025-07-10');

    const formattedMonth = formatMonth(date);

    expect(formattedMonth).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-10');

    const isInRange = isDateInRange(date, rangeStart, rangeEnd);

    expect(isInRange).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-01');

    const isInRange = isDateInRange(date, rangeStart, rangeEnd);

    expect(isInRange).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const date = new Date('2025-07-31');

    const isInRange = isDateInRange(date, rangeStart, rangeEnd);

    expect(isInRange).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const date = new Date('2025-06-30');

    const isInRange = isDateInRange(date, rangeStart, rangeEnd);

    expect(isInRange).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const date = new Date('2025-08-01');

    const isInRange = isDateInRange(date, rangeStart, rangeEnd);

    expect(isInRange).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const date1 = new Date('2025-07-31');
    const date2 = new Date('2025-07-01');

    const isInRange1 = isDateInRange(date1, rangeEnd, rangeStart);
    const isInRange2 = isDateInRange(date2, rangeEnd, rangeStart);

    expect(isInRange1).toBe(false);
    expect(isInRange2).toBe(false);
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
    const value = 1;

    const result = fillZero(value);

    expect(result).toBe('01');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const value = 12345;
    const size = 2;

    const result = fillZero(value, size);

    expect(result).toBe('12345');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date(2025, 6, 10);

    const formattedDate = formatDate(date);

    expect(formattedDate).toBe('2025-07-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date(2025, 6, 10);
    const day = 1;

    const formattedDate = formatDate(date, day);

    expect(formattedDate).toBe('2025-07-01');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date(2025, 6, 10);
    const day = 1;

    const formattedDate = formatDate(date, day);

    expect(formattedDate).toBe('2025-07-01');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date(2025, 6, 1);
    const day = 1;

    const formattedDate = formatDate(date, day);

    expect(formattedDate).toBe('2025-07-01');
  });
});
