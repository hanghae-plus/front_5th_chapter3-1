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
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2024, 13)).toBe(31);
    expect(getDaysInMonth(2024, 0)).toBe(31);
  });

  it('음수 월은 기본값으로 처리된다', () => {
    expect(getDaysInMonth(2025, -1)).toBe(30);
  });

  it('유효하지 않은 month(NaN) 입력 시 NaN을 반환한다', () => {
    expect(getDaysInMonth(2025, NaN)).toBeNaN();
  });
});

describe('getWeekDates', () => {
  const toDateStrings = (dates: Date[]) => dates.map((d) => d.toDateString());

  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const input = new Date('2025-05-07'); // 수요일
    const result = getWeekDates(input);
    const expected = [
      new Date('2025-05-04'), // 일
      new Date('2025-05-05'),
      new Date('2025-05-06'),
      new Date('2025-05-07'),
      new Date('2025-05-08'),
      new Date('2025-05-09'),
      new Date('2025-05-10'), // 토
    ];
    expect(result.map((d) => d.toDateString())).toEqual(toDateStrings(expected));
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const input = new Date('2025-05-12'); // 월요일
    const result = getWeekDates(input);
    const expected = [
      new Date('2025-05-11'), // 일
      new Date('2025-05-12'),
      new Date('2025-05-13'),
      new Date('2025-05-14'),
      new Date('2025-05-15'),
      new Date('2025-05-16'),
      new Date('2025-05-17'), // 토
    ];
    expect(result.map((d) => d.toDateString())).toEqual(toDateStrings(expected));
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const input = new Date('2025-05-11'); // 일요일
    const result = getWeekDates(input);
    const expected = [
      new Date('2025-05-11'), // 일
      new Date('2025-05-12'),
      new Date('2025-05-13'),
      new Date('2025-05-14'),
      new Date('2025-05-15'),
      new Date('2025-05-16'),
      new Date('2025-05-17'), // 토
    ];
    expect(toDateStrings(result)).toEqual(toDateStrings(expected));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const input = new Date('2024-12-31'); // 화요일
    const result = getWeekDates(input);
    const expected = [
      new Date('2024-12-29'), // 일
      new Date('2024-12-30'),
      new Date('2024-12-31'),
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      new Date('2025-01-03'),
      new Date('2025-01-04'), // 토
    ];
    expect(toDateStrings(result)).toEqual(toDateStrings(expected));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const input = new Date('2025-01-01'); // 수요일
    const result = getWeekDates(input);
    const expected = [
      new Date('2024-12-29'), // 일
      new Date('2024-12-30'),
      new Date('2024-12-31'),
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      new Date('2025-01-03'),
      new Date('2025-01-04'), // 토
    ];
    expect(toDateStrings(result)).toEqual(toDateStrings(expected));
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const input = new Date('2024-02-29'); // 목요일
    const result = getWeekDates(input);
    const expected = [
      new Date('2024-02-25'), // 일
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'), // 토
    ];
    expect(toDateStrings(result)).toEqual(toDateStrings(expected));
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const input = new Date('2025-04-30'); // 수요일
    const result = getWeekDates(input);
    const expected = [
      new Date('2025-04-27'), // 일
      new Date('2025-04-28'),
      new Date('2025-04-29'),
      new Date('2025-04-30'),
      new Date('2025-05-01'),
      new Date('2025-05-02'),
      new Date('2025-05-03'), // 토
    ];
    expect(toDateStrings(result)).toEqual(toDateStrings(expected));
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const result = getWeeksAtMonth(new Date('2025-07-01'));

    /**
     * 2025년 7월 1일은 화요일
     * 7월은 31일까지
     * 요일 순서: 일(0) ~ 토(6)
     */
    expect(result).toEqual([
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ]);
  });

  it('2024년 2월(윤년)의 주차 정보를 올바르게 반환해야 한다', () => {
    const result = getWeeksAtMonth(new Date('2024-02-01'));

    /**
     * 2024년 2월 1일은 목요일
     * 2024년은 윤년이므로 2월은 29일까지
     */
    expect(result).toEqual([
      [null, null, null, null, 1, 2, 3],
      [4, 5, 6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15, 16, 17],
      [18, 19, 20, 21, 22, 23, 24],
      [25, 26, 27, 28, 29, null, null],
    ]);
  });

  it('2024년 6월은 6주의 배열을 반환한다', () => {
    const result = getWeeksAtMonth(new Date('2024-06-01'));
    expect(result).toEqual([
      [null, null, null, null, null, null, 1],
      [2, 3, 4, 5, 6, 7, 8],
      [9, 10, 11, 12, 13, 14, 15],
      [16, 17, 18, 19, 20, 21, 22],
      [23, 24, 25, 26, 27, 28, 29],
      [30, null, null, null, null, null, null],
    ]);
    expect(result.length).toBe(6);
  });

  it('주 배열의 각 항목은 7일을 가져야 한다', () => {
    const result = getWeeksAtMonth(new Date('2025-07-01'));
    for (const week of result) {
      expect(week.length).toBe(7);
    }
  });
});

describe('getEventsForDay', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Event 1',
      date: '2025-06-01',
      startTime: '10:00',
      endTime: '12:00',
      description: 'Description for Event 1',
      location: 'Location 1',
      category: 'Category 1',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    },
    {
      id: '2',
      title: 'Event 2',
      date: '2025-06-02',
      startTime: '14:00',
      endTime: '16:00',
      description: 'Description for Event 2',
      location: 'Location 2',
      category: 'Category 2',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 15,
    },
    {
      id: '3',
      title: 'Event 3',
      date: '2025-06-01',
      startTime: '17:00',
      endTime: '19:00',
      description: 'Description for Event 3',
      location: 'Location 3',
      category: 'Category 3',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 20,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(mockEvents, 1);
    expect(result).toEqual([
      expect.objectContaining({ id: '1' }),
      expect.objectContaining({ id: '3' }),
    ]);
    expect(result.length).toBe(2);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 3);
    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 0);
    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 32);
    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-06-15')); // 6월 15일 (중간)
    expect(result).toBe('2025년 6월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-06-01')); // 6월 1일 (첫 주)
    expect(result).toBe('2025년 6월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-06-30')); // 6월 30일 (마지막 주)
    expect(result).toBe('2025년 7월 1주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-12-31')); // 12월 31일 (연말)
    expect(result).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2024-02-29')); // 윤년 2월 29일 (마지막 주)
    expect(result).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-02-28')); // 평년 2월 28일 (마지막 주)
    expect(result).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    expect(formatMonth(new Date('2025-07-10'))).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    expect(isDateInRange(new Date('2025-07-10'), rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    expect(isDateInRange(new Date('2025-07-01'), rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    expect(isDateInRange(new Date('2025-07-31'), rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    expect(isDateInRange(new Date('2025-06-30'), rangeStart, rangeEnd)).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    expect(isDateInRange(new Date('2025-08-01'), rangeStart, rangeEnd)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    expect(isDateInRange(new Date('2025-07-01'), rangeEnd, rangeStart)).toBe(false);
    expect(isDateInRange(new Date('2025-06-30'), rangeEnd, rangeStart)).toBe(false);
    expect(isDateInRange(new Date('2025-08-01'), rangeEnd, rangeStart)).toBe(false);
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
    expect(fillZero(1)).toBe('01');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(12345, 3)).toBe('12345');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 11, 11))).toBe('2025-12-11');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 11, 11), 15)).toBe('2025-12-15');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 5, 12))).toBe('2025-06-12');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date(2025, 5, 1))).toBe('2025-06-01');
  });
});
