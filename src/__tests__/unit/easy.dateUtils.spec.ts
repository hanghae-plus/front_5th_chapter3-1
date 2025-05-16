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
    expect(getDaysInMonth(2025, 0)).toBe(31); // 0월은 이전 해 12월과 같음
    expect(getDaysInMonth(2025, 13)).toBe(31); // 13월은 다음 해 1월과 같음
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const wednesday = new Date('2025-07-09'); // 2025년 7월 9일은 수요일
    const weekDates = getWeekDates(wednesday);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getDate()).toBe(6); // 일요일
    expect(weekDates[1].getDate()).toBe(7); // 월요일
    expect(weekDates[2].getDate()).toBe(8); // 화요일
    expect(weekDates[3].getDate()).toBe(9); // 수요일
    expect(weekDates[4].getDate()).toBe(10); // 목요일
    expect(weekDates[5].getDate()).toBe(11); // 금요일
    expect(weekDates[6].getDate()).toBe(12); // 토요일
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const monday = new Date('2025-07-07'); // 2025년 7월 7일은 월요일
    const weekDates = getWeekDates(monday);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getDate()).toBe(6); // 일요일
    expect(weekDates[6].getDate()).toBe(12); // 토요일
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sunday = new Date('2025-07-06'); // 2025년 7월 6일은 일요일
    const weekDates = getWeekDates(sunday);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getDate()).toBe(6); // 일요일
    expect(weekDates[6].getDate()).toBe(12); // 토요일
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const endOfYear = new Date('2025-12-30'); // 2025년 12월 30일은 화요일
    const weekDates = getWeekDates(endOfYear);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getDate()).toBe(28); // 일요일
    expect(weekDates[0].getMonth()).toBe(11); // 12월
    expect(weekDates[0].getFullYear()).toBe(2025);

    expect(weekDates[6].getDate()).toBe(3); // 토요일
    expect(weekDates[6].getMonth()).toBe(0); // 1월
    expect(weekDates[6].getFullYear()).toBe(2026);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const startOfYear = new Date('2025-01-02'); // 2025년 1월 2일은 목요일
    const weekDates = getWeekDates(startOfYear);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getDate()).toBe(29); // 일요일
    expect(weekDates[0].getMonth()).toBe(11); // 12월
    expect(weekDates[0].getFullYear()).toBe(2024);

    expect(weekDates[6].getDate()).toBe(4); // 토요일
    expect(weekDates[6].getMonth()).toBe(0); // 1월
    expect(weekDates[6].getFullYear()).toBe(2025);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const leapYearFeb = new Date('2024-02-29'); // 2024년 2월 29일은 목요일
    const weekDates = getWeekDates(leapYearFeb);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getDate()).toBe(25); // 일요일
    expect(weekDates[4].getDate()).toBe(29); // 목요일
    expect(weekDates[6].getDate()).toBe(2); // 토요일
    expect(weekDates[6].getMonth()).toBe(2); // 3월
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const endOfMonth = new Date('2025-07-31'); // 2025년 7월 31일은 목요일
    const weekDates = getWeekDates(endOfMonth);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0].getDate()).toBe(27); // 일요일
    expect(weekDates[0].getMonth()).toBe(6); // 7월

    expect(weekDates[4].getDate()).toBe(31); // 목요일
    expect(weekDates[4].getMonth()).toBe(6); // 7월

    expect(weekDates[6].getDate()).toBe(2); // 토요일
    expect(weekDates[6].getMonth()).toBe(7); // 8월
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date('2025-07-01');
    const weeks = getWeeksAtMonth(date);

    // 2025년 7월 1일은 화요일, 7월은 31일까지 있음
    expect(weeks.length).toBe(5); // 7월은 5주로 구성

    // 첫 주는 1일(화)부터 시작, 0과 1은 이전 달의 날짜(null)
    expect(weeks[0][0]).toBeNull();
    expect(weeks[0][1]).toBeNull();
    expect(weeks[0][2]).toBe(1);
    expect(weeks[0][3]).toBe(2);
    expect(weeks[0][4]).toBe(3);
    expect(weeks[0][5]).toBe(4);
    expect(weeks[0][6]).toBe(5);

    // 둘째 주는 6일부터 12일까지
    expect(weeks[1]).toEqual([6, 7, 8, 9, 10, 11, 12]);

    // 마지막 주는 27일부터 31일까지, 나머지는 다음 달의 날짜(null)
    expect(weeks[4][0]).toBe(27);
    expect(weeks[4][4]).toBe(31);
    expect(weeks[4][5]).toBeNull();
    expect(weeks[4][6]).toBeNull();
  });
});

describe('getEventsForDay', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '설명 1',
      location: '장소 1',
      category: '카테고리 1',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '설명 2',
      location: '장소 2',
      category: '카테고리 2',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-07-01',
      startTime: '16:00',
      endTime: '17:00',
      description: '설명 3',
      location: '장소 3',
      category: '카테고리 3',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(mockEvents, 1);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('3');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(mockEvents, 2).length).toBe(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(mockEvents, 0).length).toBe(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(mockEvents, 32).length).toBe(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-15'); // 2025년 7월 15일은 화요일
    expect(formatWeek(date)).toBe('2025년 7월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-01'); // 2025년 7월 1일은 화요일
    expect(formatWeek(date)).toBe('2025년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-07-30'); // 2025년 7월 30일은 수요일
    expect(formatWeek(date)).toBe('2025년 7월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-12-30'); // 2025년 12월 30일은 화요일
    expect(formatWeek(date)).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-02-29'); // 2024년 2월 29일은 목요일
    expect(formatWeek(date)).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2025-02-27'); // 2025년 2월 27일은 목요일
    expect(formatWeek(date)).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date('2025-07-10');
    expect(formatMonth(date)).toBe('2025년 7월');
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
    const invalidRangeStart = new Date('2025-07-31');
    const invalidRangeEnd = new Date('2025-07-01');
    const date = new Date('2025-07-15');

    expect(isDateInRange(date, invalidRangeStart, invalidRangeEnd)).toBe(false);
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
    expect(fillZero(7)).toBe('07');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(123, 2)).toBe('123');
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
    const date = new Date('2025-03-10');
    expect(formatDate(date)).toBe('2025-03-10');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-07-05');
    expect(formatDate(date)).toBe('2025-07-05');
  });
});
