import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  isDateInRange,
} from '../../utils/dateUtils';

// getDaysInMonth : 해당 연도와 월에 며칠까지 있는지 반환하는 함수.
// getDaysInMonth(2025, 1)은 2025년 1월의 일 수를 반환하고, 결과는 31일

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29); // 2024는 윤년
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2023, 2)).toBe(28); // 2023은 평년
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    // 월이 13이면 다음 해의 1월로 처리되어 31일 반환됨
    expect(getDaysInMonth(2025, 13)).toBe(31);
    // 월이 0이면 전 해의 12월로 처리되어 31일 반환됨
    expect(getDaysInMonth(2025, 0)).toBe(31);
    // 음수 등 이상한 값도 JS는 자동으로 보정함
    expect(getDaysInMonth(2025, -1)).toBe(30); // 2024년 11월
  });
});

describe('getWeekDates', () => {
  function formatDates(dates: Date[]) {
    return dates.map((d) => d.toISOString().split('T')[0]);
  }

  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-02'); // 수요일
    const result = formatDates(getWeekDates(date));
    expect(result).toEqual([
      '2025-06-29',
      '2025-06-30',
      '2025-07-01',
      '2025-07-02',
      '2025-07-03',
      '2025-07-04',
      '2025-07-05',
    ]);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-06'); // 일요일
    const result = formatDates(getWeekDates(date));
    expect(result).toEqual([
      '2025-07-06',
      '2025-07-07',
      '2025-07-08',
      '2025-07-09',
      '2025-07-10',
      '2025-07-11',
      '2025-07-12',
    ]);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-12'); // 토요일
    const result = formatDates(getWeekDates(date));
    expect(result).toEqual([
      '2025-07-06',
      '2025-07-07',
      '2025-07-08',
      '2025-07-09',
      '2025-07-10',
      '2025-07-11',
      '2025-07-12',
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date('2025-12-31'); // 수요일
    const result = formatDates(getWeekDates(date));
    expect(result).toEqual([
      '2025-12-28',
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date('2025-01-01'); // 수요일
    const result = formatDates(getWeekDates(date));
    expect(result).toEqual([
      '2024-12-29',
      '2024-12-30',
      '2024-12-31',
      '2025-01-01',
      '2025-01-02',
      '2025-01-03',
      '2025-01-04',
    ]);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-29'); // 윤년 목요일
    const result = formatDates(getWeekDates(date));
    expect(result).toEqual([
      '2024-02-25',
      '2024-02-26',
      '2024-02-27',
      '2024-02-28',
      '2024-02-29',
      '2024-03-01',
      '2024-03-02',
    ]);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2025-08-31'); // 일요일
    const result = formatDates(getWeekDates(date));
    expect(result).toEqual([
      '2025-08-31',
      '2025-09-01',
      '2025-09-02',
      '2025-09-03',
      '2025-09-04',
      '2025-09-05',
      '2025-09-06',
    ]);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const input = new Date('2025-10-15'); // 수요일
    const result = getWeekDates(input);

    const expected = [
      new Date('2025-10-12'), // 일요일
      new Date('2025-10-13'),
      new Date('2025-10-14'),
      new Date('2025-10-15'),
      new Date('2025-10-16'),
      new Date('2025-10-17'),
      new Date('2025-10-18'), // 토요일
    ];

    expect(result.map((d) => d.toISOString())).toEqual(expected.map((d) => d.toISOString()));
  });
});

describe('getEventsForDay', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      location: '',
      description: '',
      category: '',
      repeat: undefined as any,
      notificationTime: '' as any,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-02',
      startTime: '12:00',
      endTime: '13:00',
      location: '',
      description: '',
      category: '',
      repeat: undefined as any,
      notificationTime: '' as any,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-08-01',
      startTime: '14:00',
      endTime: '15:00',
      location: '',
      description: '',
      category: '',
      repeat: undefined as any,
      notificationTime: '' as any,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(events, 1);
    expect(result).toEqual([
      events[0], // 2025-07-01
      events[2], // 2025-08-01 (같은 날짜이므로 포함됨)
    ]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events, 5);
    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events, 0);
    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(events, 32);
    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-07-17')); // 목요일
    expect(result).toBe('2025년 7월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-07-01'));
    expect(result).toBe('2025년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-07-31')); // 목요일
    expect(result).toBe('2025년 7월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2024-12-31')); // 화요일
    expect(result).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2024-02-29')); // 목요일 (윤년)
    expect(result).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-02-28')); // 금요일
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
    const reversedStart = new Date('2025-08-01');
    const reversedEnd = new Date('2025-07-01');
    const date = new Date('2025-07-15');
    expect(isDateInRange(date, reversedStart, reversedEnd)).toBe(false);
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
    expect(fillZero(Number('3.14'), 5)).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(7)).toBe('07');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(1234, 2)).toBe('1234');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date('2025-07-15');
    expect(formatDate(date)).toBe('2025-07-15');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2025-07-01');
    expect(formatDate(date, 20)).toBe('2025-07-20');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-03-10');
    expect(formatDate(date)).toBe('2025-03-10');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-07-05');
    expect(formatDate(date)).toBe('2025-07-05');
  });
});
