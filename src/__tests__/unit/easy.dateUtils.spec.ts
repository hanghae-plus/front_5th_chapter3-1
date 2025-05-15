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

  // 적절히 처리한다 보다는 Error를 던진다로 변경
  it('유효하지 않은 월에 대해 Error을 던진다.', () => {
    expect(() => getDaysInMonth(2025, 15)).toThrow('월은 1부터 12 사이의 값이어야 합니다.');
  });

  it('경계값 테스트로 0월은 유효하지 않은 월로 처리되어 Error을 던진다.', () => {
    expect(() => getDaysInMonth(2025, 0)).toThrow('월은 1부터 12 사이의 값이어야 합니다.');
  });

  it('경계값 테스트로 13월은 유효하지 않은 월로 처리되어 Error을 던진다.', () => {
    expect(() => getDaysInMonth(2025, 13)).toThrow('월은 1부터 12 사이의 값이어야 합니다.');
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2025-05-14'));
    expect(weekDates).toEqual([
      new Date('2025-05-11'),
      new Date('2025-05-12'),
      new Date('2025-05-13'),
      new Date('2025-05-14'),
      new Date('2025-05-15'),
      new Date('2025-05-16'),
      new Date('2025-05-17'),
    ]);
  });

  it('주의 시작(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2025-05-11'));
    expect(weekDates).toEqual([
      new Date('2025-05-11'),
      new Date('2025-05-12'),
      new Date('2025-05-13'),
      new Date('2025-05-14'),
      new Date('2025-05-15'),
      new Date('2025-05-16'),
      new Date('2025-05-17'),
    ]);
  });

  it('주의 끝(토요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2025-05-17'));
    expect(weekDates).toEqual([
      new Date('2025-05-11'),
      new Date('2025-05-12'),
      new Date('2025-05-13'),
      new Date('2025-05-14'),
      new Date('2025-05-15'),
      new Date('2025-05-16'),
      new Date('2025-05-17'),
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const weekDates = getWeekDates(new Date('2024-12-31'));
    expect(weekDates).toEqual([
      new Date('2024-12-29'),
      new Date('2024-12-30'),
      new Date('2024-12-31'),
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      new Date('2025-01-03'),
      new Date('2025-01-04'),
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const weekDates = getWeekDates(new Date('2025-01-01'));
    expect(weekDates).toEqual([
      new Date('2024-12-29'),
      new Date('2024-12-30'),
      new Date('2024-12-31'),
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      new Date('2025-01-03'),
      new Date('2025-01-04'),
    ]);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const weekDates = getWeekDates(new Date('2024-02-29'));
    expect(weekDates).toEqual([
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
    const weekDates = getWeekDates(new Date('2025-06-30'));
    expect(weekDates).toEqual([
      new Date('2025-06-29'),
      new Date('2025-06-30'),
      new Date('2025-07-01'),
      new Date('2025-07-02'),
      new Date('2025-07-03'),
      new Date('2025-07-04'),
      new Date('2025-07-05'),
    ]);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const weeks = getWeeksAtMonth(new Date('2025-07-01'));
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
      category: '업무',
      date: '2025-05-20',
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      category: '개인',
      date: '2025-05-21',
      id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
      title: '팀 회의',
      startTime: '10:00',
      endTime: '13:30',
      description: '동료와 점심 식사',
      location: '회사 근처 식당"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      category: '개인',
      date: '2025-05-01',
      id: '09702fb3-a478-40b3-905e-9ab3c8849dcdf',
      title: '팀 회의',
      startTime: '10:00',
      endTime: '13:30',
      description: '동료와 점심 식사',
      location: '회사 근처 식당"',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const eventDay = getEventsForDay(events, 1);
    expect(eventDay).toEqual([
      {
        category: '개인',
        date: '2025-05-01',
        id: '09702fb3-a478-40b3-905e-9ab3c8849dcdf',
        title: '팀 회의',
        startTime: '10:00',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당"',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const eventDay = getEventsForDay(events, 10);
    expect(eventDay).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const eventDay = getEventsForDay(events, 0);
    expect(eventDay).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const eventDay = getEventsForDay(events, 32);
    expect(eventDay).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const weekDates = formatWeek(new Date('2025-05-15'));
    expect(weekDates).toBe('2025년 5월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const weekDates = formatWeek(new Date('2025-05-01'));
    expect(weekDates).toBe('2025년 5월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const weekDates = formatWeek(new Date('2025-05-30'));
    expect(weekDates).toBe('2025년 5월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const weekDates = formatWeek(new Date('2025-01-01'));
    expect(weekDates).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const weekDates = formatWeek(new Date('2024-02-29'));
    expect(weekDates).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const weekDates = formatWeek(new Date('2025-02-28'));
    expect(weekDates).toBe('2025년 2월 4주');
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
    const result = isDateInRange(new Date('2025-07-10'), new Date('2025-08-01'), rangeEnd);
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
    const result = fillZero(3);
    expect(result).toBe('03');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const result = fillZero(100, 2);
    expect(result).toBe('100');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const formatted = formatDate(new Date('2025-05-12T00:00:00Z'));
    expect(formatted).toBe('2025-05-12');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const formatted = formatDate(new Date('2025-05-20'), 10);
    expect(formatted).toBe('2025-05-10');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const formatted = formatDate(new Date('2025-5-01'), 10);
    expect(formatted).toBe('2025-05-10');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const formatted = formatDate(new Date('2025-05-1'), 1);
    expect(formatted).toBe('2025-05-01');
  });
});
