import { Event } from '../../types';
import {
  getDaysInMonth,
  getWeekDates,
  getWeeksAtMonth,
  getEventsForDay,
  formatWeek,
  formatMonth,
  isDateInRange,
  fillZero,
  formatDate,
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
    expect(getDaysInMonth(2023, 2)).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2025, 0)).toBe(31); // 0월은 12월로 간주됨
    expect(getDaysInMonth(2025, 13)).toBe(31); // 13월은 다음 해 1월로 간주됨
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-09'); // 수요일
    const week = getWeekDates(date);
    expect(week[0].getDay()).toBe(0); // 일요일
    expect(week[3].getDay()).toBe(3); // 수요일
    expect(week.length).toBe(7);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-07'); // 월요일
    const week = getWeekDates(date);
    expect(week[1].getDay()).toBe(1); // 월요일
    expect(week.length).toBe(7);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-07-13'); // 일요일
    const week = getWeekDates(date);
    expect(week[6].getDay()).toBe(6); // 토요일
    expect(week[0].getDay()).toBe(0); // 일요일
    expect(week.length).toBe(7);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date('2024-12-31'); // 화요일
    const week = getWeekDates(date);
    expect(week[0].getFullYear()).toBe(2024);
    expect(week[6].getFullYear()).toBe(2025);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date('2025-01-01'); // 수요일
    const week = getWeekDates(date);
    expect(week[0].getFullYear()).toBe(2024);
    expect(week[6].getFullYear()).toBe(2025);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-29'); // 목요일
    const week = getWeekDates(date);
    expect(week.some((d) => d.getDate() === 29 && d.getMonth() === 1)).toBe(true);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2025-07-31'); // 목요일
    const week = getWeekDates(date);
    expect(week.some((d) => d.getDate() === 31 && d.getMonth() === 6)).toBe(true);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const weeks = getWeeksAtMonth(new Date('2025-07-01'));
    expect(Array.isArray(weeks)).toBe(true);
    expect(weeks.length).toBeGreaterThan(3);
    expect(weeks[0].length).toBe(7);
  });
});

describe('getEventsForDay', () => {
  const events: Event[] = [
    {
      id: '1',
      title: 'A',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: 'B',
      date: '2025-07-02',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 20,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const filtered = getEventsForDay(events, 1);
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('1');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const filtered = getEventsForDay(events, 3);
    expect(filtered.length).toBe(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const filtered = getEventsForDay(events, 0);
    expect(filtered.length).toBe(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const filtered = getEventsForDay(events, 32);
    expect(filtered.length).toBe(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-07-16'));
    expect(result).toBe('2025년 7월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-07-03'));
    expect(result).toBe('2025년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2025-07-31'));
    expect(result).toMatch(/2025년 7월 \d+주/);
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2024-12-31'));
    expect(result).toMatch(/2025년 1월 1주|2024년 12월 \d+주/);
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2024-02-29'));
    expect(result).toMatch(/2024년 2월 \d+주/);
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const result = formatWeek(new Date('2023-02-28'));
    expect(result).toBe('2023년 3월 1주');
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
    expect(isDateInRange(new Date('2025-07-10'), rangeEnd, rangeStart)).toBe(false);
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
    expect(fillZero(1234, 2)).toBe('1234');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    expect(formatDate(new Date('2025-07-10'))).toBe('2025-07-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    expect(formatDate(new Date('2025-07-10'), 5)).toBe('2025-07-05');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date('2025-03-10'))).toBe('2025-03-10');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date('2025-07-01'))).toBe('2025-07-01');
  });
});
