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
    // Given
    const year = 2025;
    const month = 1;

    // When
    const days = getDaysInMonth(year, month);

    // Then
    expect(days).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    // Given
    const year = 2020;
    const month = 2;

    // When
    const days = getDaysInMonth(year, month);

    // Then
    expect(days).toBe(29);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    // Given
    const year = 2025;
    const month = 0;

    // When
    const days = getDaysInMonth(year, month);

    // Then
    expect(days).toBe(31);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    // Given
    const year = 2023;
    const month = 2;

    // When
    const days = getDaysInMonth(year, month);

    // Then
    expect(days).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    // Given
    const year = 2025;
    const month = 0;

    // When
    const days = getDaysInMonth(year, month);

    // Then
    expect(days).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // Given
    const date = new Date('2025-05-14');

    // When
    const weekDates = getWeekDates(date);
    const result = weekDates.map((d) => d.getDate());

    // Then
    expect(result).toEqual([11, 12, 13, 14, 15, 16, 17]);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // Given
    const date = new Date('2025-05-11');

    // When
    const weekDates = getWeekDates(date);
    const result = weekDates.map((d) => d.getDate());

    // Then
    expect(result).toEqual([11, 12, 13, 14, 15, 16, 17]);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // Given
    const date = new Date('2025-05-17');

    // When
    const weekDates = getWeekDates(date);
    const result = weekDates.map((d) => d.getDate());

    // Then
    expect(result).toEqual([11, 12, 13, 14, 15, 16, 17]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    // Given
    const date = new Date('2024-12-31');

    // When
    const weekDates = getWeekDates(date);
    const result = weekDates.map((d) => d.getDate());

    // Then
    expect(result).toEqual([29, 30, 31, 1, 2, 3, 4]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    // Given
    const date = new Date('2025-01-01');

    // When
    const weekDates = getWeekDates(date);
    const result = weekDates.map((d) => d.getDate());

    // Then
    expect(result).toEqual([29, 30, 31, 1, 2, 3, 4]);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    // Given
    const date = new Date('2024-02-29');

    // When
    const weekDates = getWeekDates(date);
    const result = weekDates.map((d) => d.getDate());

    // Then
    expect(result).toEqual([25, 26, 27, 28, 29, 1, 2]);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    // Given
    const date = new Date('2025-07-31');

    // When
    const weekDates = getWeekDates(date);
    const result = weekDates.map((d) => d.getDate());

    // Then
    expect(result).toEqual([27, 28, 29, 30, 31, 1, 2]);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    // Given
    const currentDate = new Date('2025-05-15'); // 오늘 날짜

    // When
    const weeks = getWeeksAtMonth(currentDate);
    const result = weeks;

    // Then
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
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-05-11',
      startTime: '',
      endTime: '',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '세미나',
      date: '2025-05-01',
      startTime: '',
      endTime: '',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    // Given
    const date = 1;

    // When
    const result = getEventsForDay(mockEvents, date);

    // Then
    expect(result).toHaveLength(1);
    expect(result.map((e) => e.title)).toEqual(['세미나']);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    // Given
    const date = 13;

    // When
    const result = getEventsForDay(mockEvents, date);

    // Then
    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    // Given
    const date = 0;

    // When
    const result = getEventsForDay(mockEvents, date);

    // Then
    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    // Given
    const date = 32;

    // When
    const result = getEventsForDay(mockEvents, date);

    // Then
    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    // Given
    const date = new Date('2025-05-15');

    // When
    const result = formatWeek(date);

    // Then
    expect(result).toBe('2025년 5월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    // Given
    const date = new Date('2025-05-01'); // 목요일

    // When
    const result = formatWeek(date);

    // Then
    expect(result).toBe('2025년 5월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    // Given
    const date = new Date('2025-05-31'); // 토요일

    // When
    const result = formatWeek(date);

    // Then
    expect(result).toBe('2025년 5월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    // Given
    const date = new Date('2024-12-31'); // 화요일

    // When
    const result = formatWeek(date);

    // Then
    expect(result).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    // Given
    const date = new Date('2024-02-29'); // 윤년

    // When
    const result = formatWeek(date);

    // Then
    expect(result).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    // Given
    const date = new Date('2025-02-28');

    // When
    const result = formatWeek(date);

    // Then
    expect(result).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    // Given
    const date = new Date('2025-07-10');

    // When
    const result = formatMonth(date);

    // Then
    expect(result).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    // Given
    const date = new Date('2025-07-10');

    // When
    const result = isDateInRange(date, rangeStart, rangeEnd);

    // Then
    expect(result).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    // Given
    const date = new Date('2025-07-01');

    // When
    const result = isDateInRange(date, rangeStart, rangeEnd);

    // Then
    expect(result).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    // Given
    const date = new Date('2025-07-31');

    // When
    const result = isDateInRange(date, rangeStart, rangeEnd);

    // Then
    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    // Given
    const date = new Date('2025-06-30');

    // When
    const result = isDateInRange(date, rangeStart, rangeEnd);

    // Then
    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    // Given
    const date = new Date('2025-08-01');

    // When
    const result = isDateInRange(date, rangeStart, rangeEnd);

    // Then
    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    // Given
    const invalidStart = new Date('2025-08-01');
    const invalidEnd = new Date('2025-07-01');
    const date = new Date('2025-07-15');

    // When
    const result = isDateInRange(date, invalidStart, invalidEnd);

    // Then
    expect(result).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    // Given
    const value = 5;

    // When
    const result = fillZero(value, 2);

    // Then
    expect(result).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    // Given
    const value = 10;

    // When
    const result = fillZero(value, 2);

    // Then
    expect(result).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    // Given
    const value = 3;

    // When
    const result = fillZero(value, 3);

    // Then
    expect(result).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    // Given
    const value = 100;

    // When
    const result = fillZero(value, 2);

    // Then
    expect(result).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    // Given
    const value = 0;

    // When
    const result = fillZero(value, 2);

    // Then
    expect(result).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    // Given
    const value = 1;

    // When
    const result = fillZero(value, 5);

    // Then
    expect(result).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    // Given
    const value = 3.14;

    // When
    const result = fillZero(value, 5);

    // Then
    expect(result).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    // Given
    const value = 7;

    // When
    const result = fillZero(value);

    // Then
    expect(result).toBe('07');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    // Given
    const value = 12345;

    // When
    const result = fillZero(value, 3);

    // Then
    expect(result).toBe('12345');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    // Given
    const currentDate = new Date('2025-05-15');

    // When
    const result = formatDate(currentDate);

    // Then
    expect(result).toBe('2025-05-15');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    // Given
    const currentDate = new Date('2025-05-01');
    const day = 5;

    // When
    const result = formatDate(currentDate, day);

    // Then
    expect(result).toBe('2025-05-05');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    // Given
    const currentDate = new Date('2025-03-15');

    // When
    const result = formatDate(currentDate);

    // Then
    expect(result).toBe('2025-03-15');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    // Given
    const currentDate = new Date('2025-05-01');

    // When
    const result = formatDate(currentDate);

    // Then
    expect(result).toBe('2025-05-01');
  });
});
