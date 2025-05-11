import realEvents from '../../__mocks__/response/realEvents.json';
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
    expect(getDaysInMonth(2025, 13)).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2025-05-14'));
    assertDate(weekDates[0], new Date('2025-05-11'));
    assertDate(weekDates[1], new Date('2025-05-12'));
    assertDate(weekDates[2], new Date('2025-05-13'));
    assertDate(weekDates[3], new Date('2025-05-14'));
    assertDate(weekDates[4], new Date('2025-05-15'));
    assertDate(weekDates[5], new Date('2025-05-16'));
    assertDate(weekDates[6], new Date('2025-05-17'));
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2025-05-12'));
    assertDate(weekDates[0], new Date('2025-05-11'));
    assertDate(weekDates[1], new Date('2025-05-12'));
    assertDate(weekDates[2], new Date('2025-05-13'));
    assertDate(weekDates[3], new Date('2025-05-14'));
    assertDate(weekDates[4], new Date('2025-05-15'));
    assertDate(weekDates[5], new Date('2025-05-16'));
    assertDate(weekDates[6], new Date('2025-05-17'));
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2025-05-17'));
    assertDate(weekDates[0], new Date('2025-05-11'));
    assertDate(weekDates[1], new Date('2025-05-12'));
    assertDate(weekDates[2], new Date('2025-05-13'));
    assertDate(weekDates[3], new Date('2025-05-14'));
    assertDate(weekDates[4], new Date('2025-05-15'));
    assertDate(weekDates[5], new Date('2025-05-16'));
    assertDate(weekDates[6], new Date('2025-05-17'));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const weekDates = getWeekDates(new Date('2025-12-31'));
    assertDate(weekDates[0], new Date('2025-12-28'));
    assertDate(weekDates[1], new Date('2025-12-29'));
    assertDate(weekDates[2], new Date('2025-12-30'));
    assertDate(weekDates[3], new Date('2025-12-31'));
    assertDate(weekDates[4], new Date('2026-01-01'));
    assertDate(weekDates[5], new Date('2026-01-02'));
    assertDate(weekDates[6], new Date('2026-01-03'));
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const weekDates = getWeekDates(new Date('2025-01-01'));
    assertDate(weekDates[0], new Date('2024-12-29'));
    assertDate(weekDates[1], new Date('2024-12-30'));
    assertDate(weekDates[2], new Date('2024-12-31'));
    assertDate(weekDates[3], new Date('2025-01-01'));
    assertDate(weekDates[4], new Date('2025-01-02'));
    assertDate(weekDates[5], new Date('2025-01-03'));
    assertDate(weekDates[6], new Date('2025-01-04'));
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const weekDates = getWeekDates(new Date('2024-02-29'));
    assertDate(weekDates[0], new Date('2024-02-25'));
    assertDate(weekDates[1], new Date('2024-02-26'));
    assertDate(weekDates[2], new Date('2024-02-27'));
    assertDate(weekDates[3], new Date('2024-02-28'));
    assertDate(weekDates[4], new Date('2024-02-29'));
    assertDate(weekDates[5], new Date('2024-03-01'));
    assertDate(weekDates[6], new Date('2024-03-02'));
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const weekDates = getWeekDates(new Date('2025-04-30'));
    assertDate(weekDates[0], new Date('2025-04-27'));
    assertDate(weekDates[1], new Date('2025-04-28'));
    assertDate(weekDates[2], new Date('2025-04-29'));
    assertDate(weekDates[3], new Date('2025-04-30'));
    assertDate(weekDates[4], new Date('2025-05-01'));
    assertDate(weekDates[5], new Date('2025-05-02'));
    assertDate(weekDates[6], new Date('2025-05-03'));
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const weeks = getWeeksAtMonth(new Date('2025-07-01'));
    expect(weeks).toHaveLength(5);
    expect(weeks[0]).toEqual([null, null, 1, 2, 3, 4, 5]);
    expect(weeks[1]).toEqual([6, 7, 8, 9, 10, 11, 12]);
    expect(weeks[2]).toEqual([13, 14, 15, 16, 17, 18, 19]);
    expect(weeks[3]).toEqual([20, 21, 22, 23, 24, 25, 26]);
    expect(weeks[4]).toEqual([27, 28, 29, 30, 31, null, null]);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(21일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events = getEventsForDay(realEvents.events as Event[], 21);
    expect(events).toHaveLength(1);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(realEvents.events as Event[], 1);
    expect(events).toHaveLength(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(realEvents.events as Event[], 0);
    expect(events).toHaveLength(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(realEvents.events as Event[], 32);
    expect(events).toHaveLength(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const weekInfo = formatWeek(new Date('2025-05-15'));
    expect(weekInfo).toBe('2025년 5월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const weekInfo = formatWeek(new Date('2025-05-01'));
    expect(weekInfo).toBe('2025년 5월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const weekInfo = formatWeek(new Date('2025-05-31'));
    expect(weekInfo).toBe('2025년 5월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const weekInfo = formatWeek(new Date('2025-12-31'));
    expect(weekInfo).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const weekInfo = formatWeek(new Date('2024-02-29'));
    expect(weekInfo).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const weekInfo = formatWeek(new Date('2025-02-28'));
    expect(weekInfo).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const monthInfo = formatMonth(new Date('2025-07-10'));
    expect(monthInfo).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const dateList = [
      '2025-07-01',
      '2025-07-04',
      '2025-07-12',
      '2025-07-19',
      '2025-07-24',
      '2025-07-31',
    ];
    dateList.forEach((date) => {
      const isInRange = isDateInRange(new Date(date), rangeStart, rangeEnd);
      expect(isInRange).toBe(true);
    });
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
    const rangeStart = new Date('2025-07-31');
    const rangeEnd = new Date('2025-07-01');
    const dateList = [
      '2025-07-01',
      '2025-07-04',
      '2025-07-12',
      '2025-07-19',
      '2025-07-24',
      '2025-07-31',
    ];
    dateList.forEach((date) => {
      const isInRange = isDateInRange(new Date(date), rangeStart, rangeEnd);
      expect(isInRange).toBe(false);
    });
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {});

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {});

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {});

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {});

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {});

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {});

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {});

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {});

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {});
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {});

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {});

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});
});
