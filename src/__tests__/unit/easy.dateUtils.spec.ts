import realEvents from '../../__mocks__/response/realEvents.json';
import type { Event } from '../../types';
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
import { getFollowing7Days } from '../utils';

describe('getDaysInMonth', () => {
  it('1월에 대해 31일을 반환한다', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  it('4월에 대해 30일을 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  it('유효하지 않은 월에 대해 NaN을 반환한다', () => {
    expect(getDaysInMonth(2025, Number.MAX_SAFE_INTEGER)).toBeNaN();
    expect(getDaysInMonth(2025, Number.MAX_VALUE)).toBeNaN();
    expect(getDaysInMonth(2025, Number.MIN_SAFE_INTEGER)).toBeNaN();
    expect(getDaysInMonth(2025, NaN)).toBeNaN();
    expect(getDaysInMonth(2025, Number.NEGATIVE_INFINITY)).toBeNaN();
    expect(getDaysInMonth(2025, Number.POSITIVE_INFINITY)).toBeNaN();
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 해당 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-05-07');
    const weekDates = getFollowing7Days(new Date('2025-05-04'));

    expect(new Date(date).getDay()).toBe(3);
    expect(getWeekDates(new Date(date))).toEqual(weekDates);
  });

  it('주의 시작(월요일)에 대해 해당 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-04-07');
    const weekDates = getFollowing7Days(new Date('2025-04-06'));

    expect(new Date(date).getDay()).toBe(1);
    expect(getWeekDates(new Date(date))).toEqual(weekDates);
  });

  it('주의 끝(일요일)에 대해 해당 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-03-09');
    const weekDates = getFollowing7Days(new Date('2025-03-09'));

    expect(new Date(date).getDay()).toBe(0);
    expect(getWeekDates(new Date(date))).toEqual(weekDates);
  });

  it('연도를 넘어가는 주의 날짜(연말)에 대해 해당 주의 날짜들을 반환한다', () => {
    const date = new Date('2024-12-31');
    const weekDates = getFollowing7Days(new Date('2024-12-29'));

    expect(getWeekDates(new Date(date))).toEqual(weekDates);
  });

  it('연도를 넘어가는 주의 날짜(연초)에 대해 해당 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-01-01');
    const weekDates = getFollowing7Days(new Date('2024-12-29'));

    expect(getWeekDates(new Date(date))).toEqual(weekDates);
  });

  it('윤년의 2월 29일을 포함한 주의 날짜에 대해 해당 주의 날짜들을 반환한다', () => {
    const date = new Date('2024-02-29');
    const weekDates = getFollowing7Days(new Date('2024-02-25'));

    expect(getWeekDates(new Date(date))).toEqual(weekDates);
  });

  it('월의 마지막 날짜를 포함한 주의 날짜에 대해 해당 주의 날짜들을 반환한다.', () => {
    const date = new Date('2024-04-30');
    const weekDates = getFollowing7Days(new Date('2024-04-28'));

    expect(getWeekDates(new Date(date))).toEqual(weekDates);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일이 포함된 월의 모든 주를 배열로 반환한다', () => {
    const weeks = [
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 31, null, null],
    ];

    expect(getWeeksAtMonth(new Date('2025-07-01'))).toEqual(weeks);
  });

  it('다른 달과 겹치는 주도 포함해 해당 월에 속한 모든 주를 배열로 반환한다', () => {
    const weeks = [
      [null, null, null, null, null, 1, 2],
      [3, 4, 5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14, 15, 16],
      [17, 18, 19, 20, 21, 22, 23],
      [24, 25, 26, 27, 28, 29, 30],
      [31, null, null, null, null, null, null],
    ];

    expect(getWeeksAtMonth(new Date('2025-08-11'))).toEqual(weeks);
  });
});

describe('getEventsForDay', () => {
  it('입력한 일이 일치하는 이벤트만 반환한다 (ex. 20일 입력 시 20일인 이벤트들 반환)', () => {
    expect(getEventsForDay(realEvents.events as Event[], 20)).toEqual([
      expect.objectContaining({ date: '2025-05-20' }),
    ]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(realEvents.events as Event[], 3)).toHaveLength(0);
    expect(getEventsForDay(realEvents.events as Event[], 30)).toHaveLength(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(realEvents.events as Event[], 0)).toHaveLength(0);
  });

  it('날짜가 음수일 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(realEvents.events as Event[], -4)).toHaveLength(0);
    expect(getEventsForDay(realEvents.events as Event[], -20)).toHaveLength(0);
    expect(getEventsForDay(realEvents.events as Event[], -10)).toHaveLength(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(realEvents.events as Event[], 32)).toHaveLength(0);
    expect(getEventsForDay(realEvents.events as Event[], 35)).toHaveLength(0);
    expect(getEventsForDay(realEvents.events as Event[], 40)).toHaveLength(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2025-05-14'))).toBe('2025년 5월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2025-04-02'))).toBe('2025년 4월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2025-03-25'))).toBe('2025년 3월 4주');
  });

  it('월이 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2025-06-29'))).toBe('2025년 7월 1주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2025-12-30'))).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2024-02-27'))).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    expect(formatWeek(new Date('2025-02-25'))).toBe('2025년 2월 4주');
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
    expect(isDateInRange(new Date('2025-07-10'), rangeStart, rangeEnd)).toBeTruthy();
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    expect(isDateInRange(rangeStart, rangeStart, rangeEnd)).toBeTruthy();
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    expect(isDateInRange(rangeEnd, rangeStart, rangeEnd)).toBeTruthy();
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    expect(isDateInRange(new Date('2025-06-30'), rangeStart, rangeEnd)).toBeFalsy();
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    expect(isDateInRange(new Date('2025-08-01'), rangeStart, rangeEnd)).toBeFalsy();
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const rangeEnd = new Date('2025-06-30');

    expect(isDateInRange(rangeStart, rangeStart, rangeEnd)).toBeFalsy();
    expect(isDateInRange(rangeEnd, rangeStart, rangeEnd)).toBeFalsy();
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5, 2)).toBe('05');
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10, 2)).toBe('10');
  });

  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100, 2)).toBe('100');
  });

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0, 2)).toBe('00');
  });

  it("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  it("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  it("음수인 -3을 5자리로 변환하면 '000-3'을 반환한다", () => {
    expect(fillZero(-3, 5)).toBe('000-3');
  });

  it('size 파라미터를 생략하면 기본값 2를 사용해 두자릿수를 반환한다', () => {
    expect(fillZero(5)).toBe('05');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(1000, 3)).toBe('1000');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    expect(formatDate(new Date('2025-05-14'))).toBe('2025-05-14');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    expect(formatDate(new Date('2025-05'), 14)).toBe('2025-05-14');
  });

  it('day가 아예 제공되지 않으면 YYYY-MM-01 형식으로 포맷팅한다', () => {
    expect(formatDate(new Date('2025-05'))).toBe('2025-05-01');
  });

  it('연도만 제공되면 YYYY-01-01 형식으로 포맷팅한다', () => {
    expect(formatDate(new Date('2025'))).toBe('2025-01-01');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date('2025-5-01'))).toBe('2025-05-01');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    expect(formatDate(new Date('2025-05-1'))).toBe('2025-05-01');
  });
});
