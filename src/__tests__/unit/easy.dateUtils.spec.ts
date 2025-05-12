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

  it('유효하지 않은 월(0월)에 대해 31을 반환한다', () => {
    expect(getDaysInMonth(2025, 0)).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('2025-10-01(수요일)을 기준으로 해당 주의 일~토 7일을 반환한다', () => {
    const date = new Date('2025-10-01');
    const result = getWeekDates(new Date(date));

    expect(result).toHaveLength(7);
    expect(result[0].getDay()).toBe(0); // 일요일
    expect(result[6].getDay()).toBe(6); // 토요일

    const dates = result.map((d) => d.toISOString().slice(0, 10));
    expect(dates).toContain('2025-10-01');
  });

  it('2025-09-29(월요일)을 기준으로 주간 일~토 날짜를 반환한다', () => {
    const date = new Date('2025-09-29'); // 월요일
    const result = getWeekDates(new Date(date));

    expect(result).toHaveLength(7);
    expect(result.map((d) => d.getDay())).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(result.map((d) => d.getDate())).toContain(29);
  });

  it('2025-10-05(일요일)을 기준으로 해당 주의 날짜를 반환하고 5일이 포함되어야 한다', () => {
    const date = new Date('2025-10-05');
    const result = getWeekDates(new Date(date));

    expect(result).toHaveLength(7);
    expect(result.map((d) => d.getDate())).toContain(5);
  });

  it('2025-12-31(연말 수요일)을 기준으로 다음 해(2026) 날짜가 포함된 주를 반환한다', () => {
    const date = new Date('2025-12-31');
    const result = getWeekDates(new Date(date));

    expect(result).toHaveLength(7);
    expect(result.some((d) => d.getFullYear() === 2026)).toBe(true);
  });

  it('2026-01-01(연초 목요일)을 기준으로 이전 해(2025) 날짜가 포함된 주를 반환한다', () => {
    const date = new Date('2026-01-01');
    const result = getWeekDates(new Date(date));

    expect(result).toHaveLength(7);
    expect(result.some((d) => d.getFullYear() === 2025)).toBe(true);
  });

  it('2024-02-29(윤년 2월 29일 포함) 주간 배열을 반환하고 29일이 포함되어야 한다', () => {
    const date = new Date('2024-02-29');
    const result = getWeekDates(new Date(date));

    expect(result).toHaveLength(7);
    expect(result.map((d) => d.getDate())).toContain(29);
  });

  it('2025-10-31(금요일)을 기준으로 해당 주 배열에 31일이 포함되어야 한다', () => {
    const date = new Date('2025-10-31');
    const result = getWeekDates(new Date(date));

    expect(result).toHaveLength(7);
    expect(result.map((d) => d.getDate())).toContain(31);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 기준으로 5주 구성의 월간 주차 배열을 반환해야 한다', () => {
    const date = new Date('2025-07-01');
    const weeks = getWeeksAtMonth(date);

    expect(weeks).toHaveLength(5); // 5주

    expect(weeks[0]).toEqual([null, null, 1, 2, 3, 4, 5]); // 첫 주
    expect(weeks[4]).toEqual([27, 28, 29, 30, 31, null, null]); // 마지막 주

    weeks.forEach((week) => {
      expect(week).toHaveLength(7);
    });

    const flat = weeks.flat().filter((d): d is number => typeof d === 'number');
    expect(flat).toContain(1);
    expect(flat).toContain(31);
  });
});

describe('getEventsForDay', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-07-01',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '점심',
      date: '2025-07-15',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events = getEventsForDay(mockEvents, 1);
    expect(events.length).toBe(1);
    expect(events[0].title).toBe('회의');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(mockEvents, 10);
    expect(events).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(mockEvents, 0);
    expect(events).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(mockEvents, 32);
    expect(events).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-07-10'));
    expect(result).toBe('2025년 7월 2주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-07-01'));
    expect(result).toBe('2025년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-07-31'));
    expect(result).toBe('2025년 7월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-12-31'));
    expect(result).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2024-02-29')); // 윤년 2월 29일 (목)
    expect(result).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-02-28'));
    expect(result).toBe('2025년 2월 4주');
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
    const reversedStart = new Date('2025-08-01');
    const reversedEnd = new Date('2025-07-01');

    const result1 = isDateInRange(new Date('2025-07-15'), reversedStart, reversedEnd);
    const result2 = isDateInRange(new Date('2025-08-01'), reversedStart, reversedEnd);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
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
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(7)).toBe('07');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(12345, 3)).toBe('12345');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date('2025-07-10');
    expect(formatDate(date)).toBe('2025-07-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2025-07-01');
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
